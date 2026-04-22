import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { productApi } from "../apis/product.api";
import { Product, PageResponse } from "../types";

export interface CategoryInfo {
  name: string;
  bannerUrl: string;
}

export interface UseProductFilterReturn {
  products: Product[];
  pageData: PageResponse<Product> | null;
  goldTypes: string[];
  loading: boolean;
  categoryInfo: CategoryInfo;

  // Filter states
  selectedGoldType: string;
  selectedPriceRange: string;
  selectedSort: string;
  sortDir: string;

  // Panel states (mobile)
  isFilterPanelOpen: boolean;
  isSortPanelOpen: boolean;

  // Setters panel
  setIsFilterPanelOpen: (open: boolean) => void;
  setIsSortPanelOpen: (open: boolean) => void;

  // Handlers
  setSelectedGoldType: (val: string) => void;
  setSelectedPriceRange: (val: string) => void;
  handleSortChange: (val: string) => void;
  handleReset: () => void;
  loadProducts: (pageNumber?: number) => void;

  // Helpers
  formatPrice: (price: number) => string;
}

const DEFAULT_BANNER =
  "https://cdn.pnj.io/images/promo/235/1200x450-nhan-t01-25.jpg";

export function useProductFilter(): UseProductFilterReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  // --- Dữ liệu ---
  const [products, setProducts] = useState<Product[]>([]);
  const [pageData, setPageData] = useState<PageResponse<Product> | null>(null);
  const [goldTypes, setGoldTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryInfo, setCategoryInfo] = useState<CategoryInfo>({
    name: "Sản phẩm",
    bannerUrl: DEFAULT_BANNER,
  });

  // --- Filter states (đồng bộ với URL) ---
  const [selectedGoldType, setSelectedGoldType] = useState(
    searchParams.get("goldType") || "",
  );
  const [selectedPriceRange, setSelectedPriceRange] = useState(
    searchParams.get("priceRange") || "",
  );
  const [selectedSort, setSelectedSort] = useState(
    searchParams.get("sort") || "dateOfEntry",
  );
  const [sortDir, setSortDir] = useState(searchParams.get("dir") || "desc");

  // --- Panel states (mobile) ---
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isSortPanelOpen, setIsSortPanelOpen] = useState(false);

  // --- 1. Load dữ liệu ban đầu: gold types + thông tin danh mục ---
  useEffect(() => {
    productApi
      .getGoldTypes()
      .then((res) => {
        if (res.data) setGoldTypes(res.data);
      })
      .catch(() => console.error("Lỗi tải loại vàng"));

    try {
      const savedCat = localStorage.getItem("selectedCategory");
      if (savedCat) {
        const parsed = JSON.parse(savedCat) as Partial<CategoryInfo>;
        setCategoryInfo({
          name: parsed.name || "Sản phẩm",
          bannerUrl: parsed.bannerUrl || DEFAULT_BANNER,
        });
      }
    } catch {
      // localStorage hỏng → giữ giá trị mặc định
    }
  }, [searchParams.get("category")]);

  // --- 2. Load sản phẩm ---
  const loadProducts = useCallback(
    async (pageNumber = 0) => {
      setLoading(true);
      const categoryId = searchParams.get("category") || "1";
      const searchQuery = searchParams.get("search") || "";

      try {
        const params: Record<string, unknown> = {
          pageNumber,
          pageSize: 12,
          name: searchQuery || undefined,
          goldType: selectedGoldType || undefined,
          sortBy: selectedSort,
          sortDirection: sortDir,
        };

        if (selectedPriceRange && selectedPriceRange.includes("-")) {
          const [from, to] = selectedPriceRange.split("-");
          params.fromPrice = from;
          if (to !== "999999999") params.toPrice = to;
        }

        const res =
          searchQuery && !searchParams.get("category")
            ? await productApi.search(searchQuery, pageNumber, 12)
            : await productApi.getByCategory(Number(categoryId), params);

        if (res.data) {
          setProducts(res.data.content || []);
          setPageData(res.data);
        }
      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
        toast.error("Không thể tải danh sách sản phẩm.");
      } finally {
        setLoading(false);
      }
    },
    [searchParams, selectedGoldType, selectedPriceRange, selectedSort, sortDir],
  );

  // --- 3. Re-fetch + đồng bộ URL khi filter thay đổi ---
  useEffect(() => {
    loadProducts(0);

    const newParams = new URLSearchParams(searchParams);
    if (selectedGoldType) newParams.set("goldType", selectedGoldType);
    else newParams.delete("goldType");
    if (selectedPriceRange) newParams.set("priceRange", selectedPriceRange);
    else newParams.delete("priceRange");
    newParams.set("sort", selectedSort);
    newParams.set("dir", sortDir);
    setSearchParams(newParams, { replace: true });
  }, [
    selectedGoldType,
    selectedPriceRange,
    selectedSort,
    sortDir,
    searchParams.get("category"),
    searchParams.get("search"),
  ]);

  // --- Handlers ---
  const handleSortChange = (val: string) => {
    if (val === "newest") {
      setSelectedSort("dateOfEntry");
      setSortDir("desc");
    } else if (val === "price_desc") {
      setSelectedSort("price");
      setSortDir("desc");
    } else if (val === "price_asc") {
      setSelectedSort("price");
      setSortDir("asc");
    }
  };

  const handleReset = () => {
    setSelectedGoldType("");
    setSelectedPriceRange("");
    setSelectedSort("dateOfEntry");
    setSortDir("desc");
    setSearchParams({ category: searchParams.get("category") || "1" });
    setIsFilterPanelOpen(false);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN").format(price) + "đ";

  return {
    products,
    pageData,
    goldTypes,
    loading,
    categoryInfo,
    selectedGoldType,
    selectedPriceRange,
    selectedSort,
    sortDir,
    isFilterPanelOpen,
    isSortPanelOpen,
    setIsFilterPanelOpen,
    setIsSortPanelOpen,
    setSelectedGoldType,
    setSelectedPriceRange,
    handleSortChange,
    handleReset,
    loadProducts,
    formatPrice,
  };
}
