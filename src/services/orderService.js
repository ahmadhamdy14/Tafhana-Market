import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";

const ORDERS_COLLECTION = "orders";

/**
 * Create a new order in Firestore.
 * Returns the new document ID.
 */
export const createOrder = async ({ userId, customer, items, totalPrice }) => {
  const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
    userId,
    customer,
    items,
    totalPrice,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Fetch a single order by its Firestore document ID.
 */
export const getOrderById = async (orderId) => {
  const docRef = doc(db, ORDERS_COLLECTION, orderId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
};

/**
 * Fetch all orders (admin use), sorted newest first.
 */
export const getAllOrders = async () => {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/**
 * Update the status of an order.
 * Valid statuses: pending | processing | shipped | delivered | cancelled
 */
export const updateOrderStatus = async (orderId, status) => {
  const docRef = doc(db, ORDERS_COLLECTION, orderId);
  await updateDoc(docRef, { status });
};

/**
 * Fetch orders for a specific user, sorted newest first.
 * Client-side sort avoids requiring a composite Firestore index.
 */
export const getUserOrders = async (userId) => {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  const orders = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Sort newest first client-side
  return orders.sort((a, b) => {
    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
    return dateB - dateA;
  });
};

// ─── FINAL STATUSES that qualify for auto-deletion ───────────────────────────
const FINAL_STATUSES = ["delivered", "cancelled"];
const RETENTION_DAYS = 15;

/**
 * Deletes orders that have reached a final status and are older than
 * RETENTION_DAYS days. Runs client-side on page load (no Cloud Function needed).
 *
 * @param {Array} orders – The raw list returned by getUserOrders
 * @returns {Array}       – Only the orders that were NOT deleted
 */
export const deleteOldOrders = async (orders) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);

  const toDelete = orders.filter((order) => {
    if (!FINAL_STATUSES.includes(order.status)) return false;
    const createdAt = order.createdAt?.toDate
      ? order.createdAt.toDate()
      : new Date(order.createdAt || 0);
    return createdAt < cutoff;
  });

  // Delete all expired orders in parallel
  await Promise.all(
    toDelete.map((order) => deleteDoc(doc(db, ORDERS_COLLECTION, order.id)))
  );

  const deletedIds = new Set(toDelete.map((o) => o.id));
  return orders.filter((o) => !deletedIds.has(o.id));
};

/**
 * Listen to the count of pending orders (for admin badge).
 */
export const listenToPendingOrdersCount = (callback) => {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where("status", "==", "pending")
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.length);
  });
};

