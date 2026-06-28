import type {
  CostcoProductSource,
  CostcoRawProduct,
  CostcoSearchOptions,
} from "@/lib/adapters/costco/types";

const MOCK_PRODUCTS: CostcoRawProduct[] = [
  {
    itemId: "100643804",
    title: "Kirkland Signature, Organic Coconut Water, 11.1 fl oz, 12-count",
    manufacturer: "Kirkland Signature",
    category: "Water",
    sku: "1394201",
    originalPrice: 14.99,
    promotionalPrice: 10.79,
    expiryDate: null,
    promotionText: null,
    productUrl:
      "https://www.costco.com/p/-/kirkland-signature-organic-coconut-water-111-fl-oz-12-count/100643804",
    warehouseAvailability: "IN_STOCK",
  },
  {
    itemId: "100411697",
    title: "Vita Coco, Pure Coconut Water, 11.1 fl oz, 18-count",
    manufacturer: "Vita Coco",
    category: "Water",
    sku: "1218891",
    originalPrice: 26.99,
    promotionalPrice: 22.79,
    expiryDate: null,
    promotionText: "$5.80 OFF",
    productUrl: "https://www.costco.com/",
    warehouseAvailability: "IN_STOCK",
  },
];

export class MockCostcoClient implements CostcoProductSource {
  async search(options: CostcoSearchOptions): Promise<CostcoRawProduct[]> {
    const query = options.query.trim().toLowerCase();
    if (!query) return [];

    return MOCK_PRODUCTS.filter((product) =>
      product.title.toLowerCase().includes(query),
    );
  }
}
