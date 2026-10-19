import { createContext, useState, useEffect, useContext, useRef } from "react";
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

const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState([]);
  const isLoadedRef = useRef(false); // prevent writing before first load

  // 🔥 Load cart from Firestore when user logs in
  useEffect(() => {
    if (user) {
      isLoadedRef.current = false;
      const ref = doc(db, "users", user.uid);
      getDoc(ref).then((snap) => {
        if (snap.exists() && snap.data().cart) {
          setCart(snap.data().cart);
        } else {
          setCart([]);
        }
        isLoadedRef.current = true;
      });
    } else {
      setCart([]);
      isLoadedRef.current = false;
    }
  }, [user]);

  // 🔥 Save cart to Firestore whenever it changes (after load)
  useEffect(() => {
    if (!user || !isLoadedRef.current) return;

    const ref = doc(db, "users", user.uid);
    setDoc(ref, { cart }, { merge: true });
  }, [cart, user]);

  // ➕ Add to cart (supports optional selectedOptions object or item with cartItemId)
  const addToCart = (product, selectedOptions = null) => {
    if (!product) return;

    const options = selectedOptions !== null
      ? selectedOptions
      : (product.selectedOptions || {});

    const targetCartItemId = product.cartItemId || getCartItemId(product.id, options);

    const exists = cart.find(
      (item) => (item.cartItemId || item.id) === targetCartItemId
    );

    if (exists) {
      setCart(
        cart.map((item) =>
          (item.cartItemId || item.id) === targetCartItemId
            ? { ...item, qty: item.qty + 1 }
            : item
        )
      );
    } else {
      const extraPrice = calculateOptionsExtraPrice(product.options, options);
      const originalBasePrice = Number(product.basePrice ?? product.price) || 0;
      const unitPrice = originalBasePrice + extraPrice;

      setCart([
        ...cart,
        {
          ...product,
          cartItemId: targetCartItemId,
          selectedOptions: options,
          basePrice: originalBasePrice,
          extraPrice: extraPrice,
          price: unitPrice,
          qty: 1,
        },
      ]);
    }
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
    setCart(cart.filter((item) => (item.cartItemId || item.id) !== targetId));
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