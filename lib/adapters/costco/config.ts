import searchDefaults from "@/config/costco-search-defaults.json";

export type CostcoClientConfig = {
  apiUrl: string;
  clientIdentifier: string;
  clientId: string;
  locale: string;
  searchResultProvider: string;
  visitorId: string;
  warehouseId: string;
  shipToPostal: string;
  shipToState: string;
  pageSize: number;
  deliveryLocations: string[];
};

function parseDeliveryLocations(value: string | undefined): string[] {
  if (!value) {
    return searchDefaults.deliveryLocations;
  }

  const trimmed = value.trim();
  if (trimmed.startsWith("[")) {
    return JSON.parse(trimmed) as string[];
  }

  return trimmed
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function getCostcoClientConfig(): CostcoClientConfig {
  const clientIdentifier = process.env.COSTCO_CLIENT_IDENTIFIER;
  const visitorId = process.env.COSTCO_VISITOR_ID;

  if (!clientIdentifier || !visitorId) {
    throw new Error(
      "Costco API is not configured. Set COSTCO_CLIENT_IDENTIFIER and COSTCO_VISITOR_ID.",
    );
  }

  return {
    apiUrl: process.env.COSTCO_API_URL ?? searchDefaults.apiUrl,
    clientIdentifier,
    clientId: process.env.COSTCO_CLIENT_ID ?? searchDefaults.clientId,
    locale: process.env.COSTCO_LOCALE ?? searchDefaults.locale,
    searchResultProvider:
      process.env.COSTCO_SEARCH_RESULT_PROVIDER ??
      searchDefaults.searchResultProvider,
    visitorId,
    warehouseId: process.env.COSTCO_WAREHOUSE_ID ?? searchDefaults.warehouseId,
    shipToPostal:
      process.env.COSTCO_SHIP_TO_POSTAL ?? searchDefaults.shipToPostal,
    shipToState: process.env.COSTCO_SHIP_TO_STATE ?? searchDefaults.shipToState,
    pageSize: Number(process.env.COSTCO_PAGE_SIZE ?? searchDefaults.pageSize),
    deliveryLocations: parseDeliveryLocations(
      process.env.COSTCO_DELIVERY_LOCATIONS,
    ),
  };
}

export function buildCostcoSearchBody(
  config: CostcoClientConfig,
  options: { query: string; pageSize?: number; offset?: number },
) {
  return {
    visitorId: config.visitorId,
    query: options.query,
    pageSize: options.pageSize ?? config.pageSize,
    offset: options.offset ?? 0,
    orderBy: null,
    searchMode: "page",
    personalizationEnabled: true,
    warehouseId: config.warehouseId,
    shipToPostal: config.shipToPostal,
    shipToState: config.shipToState,
    deliveryLocations: config.deliveryLocations,
    filterBy: [],
    pageCategories: [],
  };
}
