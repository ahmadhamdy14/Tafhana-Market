import { useState, useEffect, useRef } from "react";
import { fetchProductsSearch } from "../services/productService";

export const useProductsSearch = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const loadingRef = useRef(loading);
  const hasMoreRef = useRef(hasMore);
  const lastDocRef = useRef(lastDoc);
  const debouncedSearchRef = useRef(debouncedSearch);
  const activeSearchTermRef = useRef("");

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    lastDocRef.current = lastDoc;
  }, [lastDoc]);

  useEffect(() => {
    debouncedSearchRef.current = debouncedSearch;
  }, [debouncedSearch]);

  // Debounce search input
  useEffect(() => {
    if (!search) {
      setDebouncedSearch("");
      return;
    }
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  const fetchNextPage = async (isFirstLoad = false, searchQuery = null) => {
    const activeSearch = searchQuery !== null ? searchQuery : debouncedSearchRef.current;

    // Only prevent concurrent requests for page scrolling (isFirstLoad === false)
    if (!isFirstLoad && loadingRef.current) {
      return;
    }
    if (!isFirstLoad && !hasMoreRef.current) {
      return;
    }

    loadingRef.current = true;
    setLoading(true);

    const currentFetchTerm = activeSearch;
    activeSearchTermRef.current = currentFetchTerm;

    try {
      const result = await fetchProductsSearch({
        searchQuery: activeSearch,
        lastDoc: isFirstLoad ? null : lastDocRef.current,
        limitCount: 10,
      });

      // Check if this query is still the active one
      if (currentFetchTerm !== activeSearchTermRef.current) {
        return;
      }

      if (isFirstLoad) {
        setProducts(result.products);
      } else {
        setProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const filtered = result.products.filter((p) => !existingIds.has(p.id));
          return [...prev, ...filtered];
        });
      }

      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      if (currentFetchTerm === activeSearchTermRef.current) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  };

  // Handle transition in/out of search mode
  useEffect(() => {
    const handleSearchChange = async () => {
      if (debouncedSearch) {
        setIsSearchActive(true);
        setProducts([]);
        setLastDoc(null);
        setHasMore(true);

        await fetchNextPage(true, debouncedSearch);
      } else {
        setIsSearchActive(false);
        setProducts([]);
        setLastDoc(null);
        setHasMore(true);
      }
    };

    handleSearchChange();
  }, [debouncedSearch]);

  const deleteProductFromState = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return {
    search,
    setSearch,
    debouncedSearch,
    isSearchActive,
    products,
    loading,
    hasMore,
    fetchNextPage: () => fetchNextPage(false),
    deleteProductFromState,
  };
};
