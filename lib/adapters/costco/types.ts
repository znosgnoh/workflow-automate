export type CostcoAttributeValue = {
  text?: string[];
  numbers?: number[];
};

export type CostcoSearchResultItem = {
  id: string;
  product: {
    title?: string;
    brands?: string[];
    categories?: string[];
    uri?: string;
    attributes?: Record<string, CostcoAttributeValue>;
    variants?: Array<{
      id?: string;
      title?: string;
      attributes?: Record<string, CostcoAttributeValue>;
    }>;
  };
  variantRollupValues?: Record<string, Array<string | number>>;
};

export type CostcoSearchResponse = {
  searchResult?: {
    results?: CostcoSearchResultItem[];
    totalSize?: number;
  };
};

/** Normalized row extracted from Costco search API before field mapping */
export type CostcoRawProduct = {
  itemId: string;
  title: string;
  manufacturer: string | null;
  category: string | null;
  sku: string | null;
  originalPrice: number | null;
  promotionalPrice: number | null;
  expiryDate: string | null;
  promotionText: string | null;
  productUrl: string | null;
  warehouseAvailability: string | null;
};

export type CostcoSearchOptions = {
  query: string;
  pageSize?: number;
  offset?: number;
};

export interface CostcoProductSource {
  search(options: CostcoSearchOptions): Promise<CostcoRawProduct[]>;
}
