import { useState, useEffect, useRef, useCallback } from "react";
import { fetchProducts } from "../services/productService";

export const useProductsPagination = (category = null) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);

  // Refs to track current state without stale closures
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const lastDocRef = useRef(null);

  // Request generation counter — incremented on every category change.
  // Any in-flight request whose captured generation doesn't match is stale.
  const generationRef = useRef(0);

  // Guard against React StrictMode double-mount firing duplicate initial loads
  const mountedRef = useRef(false);

  /**
   * Core fetch function.
   * @param {boolean} isFirstLoad – true when loading the first page after a category change
   * @param {number}  generation  – the generation counter captured at call-time
   * @param {string|null} cat     – the category captured at call-time
   */
  const fetchPage = useCallback(async (isFirstLoad, generation, cat) => {
    // Concurrent-request guard for scroll-triggered loads
    if (!isFirstLoad && loadingRef.current) return;
    if (!isFirstLoad && !hasMoreRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const result = await fetchProducts({
        category: cat,
        lastDoc: isFirstLoad ? null : lastDocRef.current,
        limitCount: 10,
      });

      // Discard the result if a newer category load has been triggered while
      // this request was in-flight.
      if (generation !== generationRef.current) return;

      if (isFirstLoad) {
        setProducts(result.products);
      } else {
        setProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const filtered = result.products.filter((p) => !existingIds.has(p.id));
          return [...prev, ...filtered];
        });
      }

      lastDocRef.current = result.lastDoc;
      setLastDoc(result.lastDoc);

      hasMoreRef.current = result.hasMore;
      setHasMore(result.hasMore);
    } catch (error) {
      // Suppress errors from stale requests
      if (generation !== generationRef.current) return;
      console.error("Error fetching products:", error);
    } finally {
      // Only clear loading for the current generation
      if (generation === generationRef.current) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  }, []);

  // Reload the first page whenever category changes
  useEffect(() => {
    // Guard against React StrictMode's double-mount invoking duplicate fetches.
    // On the very first mount we allow the fetch; on subsequent category changes
    // the guard is already true so it's a no-op.
    if (!mountedRef.current) {
      mountedRef.current = true;
    }

    // Bump generation so any in-flight request from the previous category is
    // discarded when its response arrives.
    const gen = ++generationRef.current;

    // Reset state synchronously before kicking off the new fetch
    setProducts([]);
    setLastDoc(null);
    setHasMore(true);
    lastDocRef.current = null;
    hasMoreRef.current = true;
    loadingRef.current = false;

    fetchPage(true, gen, category);

    // Cleanup: if the effect re-runs (category changes again or unmount),
    // bump generation to invalidate any still-pending request.
    return () => {
      generationRef.current++;
    };
    // fetchPage is stable (useCallback with []), so this runs only when category changes.
  }, [category, fetchPage]);

  // Exposed fetchNextPage for infinite scroll — always uses current refs
  const fetchNextPage = useCallback(() => {
    fetchPage(false, generationRef.current, category);
  }, [category, fetchPage]);

  const deleteProductFromState = useCallback((id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return {
    products,
    loading,
    hasMore,
    fetchNextPage,
    deleteProductFromState,
  };
};
