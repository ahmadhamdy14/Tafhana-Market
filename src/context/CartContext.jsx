import { createContext, useState, useEffect, useContext, useRef, useCallback } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

/**
 * Deterministically generates a unique cart item identifier based on the product ID
 * and any selected options. If no options are selected, returns the plain product ID.
 */
export const getCartItemId = (productId, selectedOptions = {}) => {
  if (!productId) return "";
  if (!selectedOptions || typeof selectedOptions !== "object") {
    return String(productId);
  }
  const keys = Object.keys(selectedOptions).sort();
  const validPairs = keys
    .filter((k) => selectedOptions[k] !== undefined && selectedOptions[k] !== null && String(selectedOptions[k]).trim() !== "")
    .map((k) => `${k}:${String(selectedOptions[k]).trim()}`);

  if (validPairs.length === 0) {
    return String(productId);
  }
  return `${productId}_${validPairs.join("__")}`;
};

/**
 * Calculate total extra price added by chosen options
 */
export const calculateOptionsExtraPrice = (options = [], selectedOptions = {}) => {
  if (!Array.isArray(options) || !selectedOptions || typeof selectedOptions !== "object") {
    return 0;
  }
  let totalExtra = 0;
  for (const group of options) {
    if (!group || !group.name) continue;
    const selectedVal = selectedOptions[group.name];
    if (!selectedVal) continue;
    if (Array.isArray(group.choices)) {
      const match = group.choices.find((c) => {
        const cName = typeof c === "object" && c !== null ? c.name : String(c);
        return cName === selectedVal;
      });
      if (match && typeof match === "object" && match !== null) {
        const extra = Number(match.price) || 0;
        if (extra > 0) {
          totalExtra += extra;
        }
      }
    }
  }
  return totalExtra;
};

/**
 * Shallow-compare two cart arrays to detect meaningful changes.
 * Returns true if they are equivalent (same items, same order, same fields).
 */
const cartsAreEqual = (a, b) => {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const ai = a[i];
    const bi = b[i];
    if (
      ai.id !== bi.id ||
      ai.cartItemId !== bi.cartItemId ||
      ai.qty !== bi.qty ||
      ai.price !== bi.price ||
      ai.basePrice !== bi.basePrice ||
      ai.extraPrice !== bi.extraPrice ||
      ai.discount !== bi.discount
    ) {
      return false;
    }
    // Compare selectedOptions
    const aOpts = ai.selectedOptions || {};
    const bOpts = bi.selectedOptions || {};
    const aKeys = Object.keys(aOpts);
    const bKeys = Object.keys(bOpts);
    if (aKeys.length !== bKeys.length) return false;
    for (const k of aKeys) {
      if (aOpts[k] !== bOpts[k]) return false;
    }
  }
  return true;
};

const DEBOUNCE_MS = 800;

const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState([]);

  // Tracks whether the initial Firestore load is complete for the current user.
  const isLoadedRef = useRef(false);

  // The uid for which the cart was last loaded — prevents cross-user overwrites.
  const loadedUidRef = useRef(null);

  // Holds the last cart snapshot that was successfully written to or read from Firestore,
  // so we can skip redundant writes when the data hasn't actually changed.
  const lastSavedCartRef = useRef([]);

  // Debounce timer handle
  const debounceTimerRef = useRef(null);

  // Ref to always have the latest cart for the debounced write without re-creating timers.
  const cartRef = useRef(cart);
  cartRef.current = cart;

  // Ref for the current user to use in debounced writes
  const userRef = useRef(user);
  userRef.current = user;

  /**
   * Flush any pending debounced write immediately (synchronous scheduling).
   * Used before logout / unmount so the latest state isn't lost.
   */
  const flushPendingWrite = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;

      const currentUser = userRef.current;
      const currentCart = cartRef.current;

      if (currentUser && isLoadedRef.current && loadedUidRef.current === currentUser.uid) {
        if (!cartsAreEqual(currentCart, lastSavedCartRef.current)) {
          const ref = doc(db, "users", currentUser.uid);
          // Fire-and-forget — we can't reliably await during unload.
          setDoc(ref, { cart: currentCart }, { merge: true }).catch((err) => {
            console.error("Error flushing cart to Firestore:", err);
          });
          lastSavedCartRef.current = currentCart;
        }
      }
    }
  }, []);

  // 🔥 Load cart from Firestore when user logs in / changes
  useEffect(() => {
    // If there's a pending write from the *previous* user session, flush it first.
    flushPendingWrite();

    if (user) {
      isLoadedRef.current = false;
      loadedUidRef.current = null;

      const ref = doc(db, "users", user.uid);
      getDoc(ref).then((snap) => {
        // Guard: if the user changed again while we were loading, discard.
        if (userRef.current?.uid !== user.uid) return;

        if (snap.exists() && snap.data().cart) {
          const loadedCart = snap.data().cart;
          setCart(loadedCart);
          lastSavedCartRef.current = loadedCart;
        } else {
          setCart([]);
          lastSavedCartRef.current = [];
        }
        loadedUidRef.current = user.uid;
        isLoadedRef.current = true;
      });
    } else {
      setCart([]);
      isLoadedRef.current = false;
      loadedUidRef.current = null;
      lastSavedCartRef.current = [];
    }
  }, [user, flushPendingWrite]);

  // 🔥 Debounced save — schedule a Firestore write 800ms after the last cart change
  useEffect(() => {
    // Don't write before the initial load is done, or if no user is signed in.
    if (!user || !isLoadedRef.current) return;

    // Don't write if the loaded uid doesn't match the current user (race guard).
    if (loadedUidRef.current !== user.uid) return;

    // Skip if the cart hasn't actually changed from what's in Firestore.
    if (cartsAreEqual(cart, lastSavedCartRef.current)) return;

    // Clear any previously scheduled write and set a new one.
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;

      const currentUser = userRef.current;
      // Re-check guards at write-time
      if (!currentUser || !isLoadedRef.current || loadedUidRef.current !== currentUser.uid) return;

      const currentCart = cartRef.current;
      if (cartsAreEqual(currentCart, lastSavedCartRef.current)) return;

      const ref = doc(db, "users", currentUser.uid);
      setDoc(ref, { cart: currentCart }, { merge: true })
        .then(() => {
          lastSavedCartRef.current = currentCart;
        })
        .catch((err) => {
          console.error("Error saving cart to Firestore:", err);
        });
    }, DEBOUNCE_MS);

    // Cleanup: clear the timer if the effect re-runs (cart changed again → new debounce).
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [cart, user]);

  // Flush pending writes on unmount
  useEffect(() => {
    return () => {
      flushPendingWrite();
    };
  }, [flushPendingWrite]);

  // ➕ Add to cart (supports optional selectedOptions object or item with cartItemId)
  const addToCart = (product, selectedOptions = null) => {
    if (!product) return;

    const options = selectedOptions !== null
      ? selectedOptions
      : (product.selectedOptions || {});

    const targetCartItemId = product.cartItemId || getCartItemId(product.id, options);

    setCart((prevCart) => {
      const exists = prevCart.find(
        (item) => (item.cartItemId || item.id) === targetCartItemId
      );

      if (exists) {
        return prevCart.map((item) =>
          (item.cartItemId || item.id) === targetCartItemId
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      } else {
        const extraPrice = calculateOptionsExtraPrice(product.options, options);
        const originalBasePrice = Number(product.basePrice ?? product.price) || 0;
        const unitPrice = originalBasePrice + extraPrice;

        return [
          ...prevCart,
          {
            ...product,
            cartItemId: targetCartItemId,
            selectedOptions: options,
            basePrice: originalBasePrice,
            extraPrice: extraPrice,
            price: unitPrice,
            qty: 1,
          },
        ];
      }
    });
  };

  // ➖ Decrease qty (accepts cartItemId or product.id)
  const decreaseQty = (targetId) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          (item.cartItemId || item.id) === targetId
            ? { ...item, qty: item.qty - 1 }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  // ❌ Remove item (accepts cartItemId or product.id)
  const removeFromCart = (targetId) => {
    setCart((prevCart) => prevCart.filter((item) => (item.cartItemId || item.id) !== targetId));
  };

  // 🧹 Clear cart
  const clearCart = () => setCart([]);

  // 🔢 Cart count
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        decreaseQty,
        removeFromCart,
        clearCart,
        cartCount,
        getCartItemId,
        calculateOptionsExtraPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
