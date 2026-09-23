import { useState, useEffect, useRef } from "react";
import { fetchProducts } from "../services/productService";

export const useProductsPagination = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);

  const loadingRef = useRef(loading);
  const hasMoreRef = useRef(hasMore);
  const lastDocRef = useRef(lastDoc);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    lastDocRef.current = lastDoc;
  }, [lastDoc]);

  const fetchNextPage = async (isFirstLoad = false) => {
    // Only prevent concurrent requests for page scrolling (isFirstLoad === false)
    if (!isFirstLoad && loadingRef.current) {
      return;
    }
    if (!isFirstLoad && !hasMoreRef.current) {
      return;
    }

    loadingRef.current = true;
    setLoading(true);

    try {
      const result = await fetchProducts({
        lastDoc: isFirstLoad ? null : lastDocRef.current,
        limitCount: 10,
      });

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
      loadingRef.current = false;
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchNextPage(true);
  }, []);

  const deleteProductFromState = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return {
    products,
    loading,
    hasMore,
    fetchNextPage: () => fetchNextPage(false),
    deleteProductFromState,
  };
};
