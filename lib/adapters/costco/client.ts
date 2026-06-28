import {
  buildCostcoSearchBody,
  getCostcoClientConfig,
} from "@/lib/adapters/costco/config";
import { parseCostcoSearchResult } from "@/lib/adapters/costco/parse-result";
import type {
  CostcoProductSource,
  CostcoRawProduct,
  CostcoSearchOptions,
  CostcoSearchResponse,
} from "@/lib/adapters/costco/types";

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 750;
const REQUEST_TIMEOUT_MS = 45_000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = REQUEST_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, { ...init, signal: controller.signal }).finally(() => {
    clearTimeout(timeoutId);
  });
}

export class CostcoApiClient implements CostcoProductSource {
  async search(options: CostcoSearchOptions): Promise<CostcoRawProduct[]> {
    const config = getCostcoClientConfig();
    const body = buildCostcoSearchBody(config, options);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
      try {
        const response = await fetchWithTimeout(config.apiUrl, {
          method: "POST",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
            Origin: "https://www.costco.com",
            Referer: "https://www.costco.com/",
            "client-identifier": config.clientIdentifier,
            client_id: config.clientId,
            locale: config.locale,
            searchResultProvider: config.searchResultProvider,
            "User-Agent":
              process.env.COSTCO_USER_AGENT ??
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
          },
          body: JSON.stringify(body),
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            `Costco API returned ${response.status} ${response.statusText}`,
          );
        }

        const payload = (await response.json()) as CostcoSearchResponse;
        const results = payload.searchResult?.results ?? [];

        return results.map((item) =>
          parseCostcoSearchResult(item, config.warehouseId),
        );
      } catch (error) {
        lastError =
          error instanceof Error && error.name === "AbortError"
            ? new Error("Costco API request timed out after 45 seconds")
            : error instanceof Error
              ? error
              : new Error("Costco API request failed");

        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS * (attempt + 1));
        }
      }
    }

    throw lastError ?? new Error("Costco API request failed");
  }
}
