import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

export const AuthContext = createContext();

// 🔒 Centralized role-based permission helpers
export const checkIsAdmin = (userDataOrRole) => {
  if (!userDataOrRole) return false;
  const role = typeof userDataOrRole === "string" ? userDataOrRole : userDataOrRole?.role;
  return role === "admin";
};

export const checkIsEditor = (userDataOrRole) => {
  if (!userDataOrRole) return false;
  const role = typeof userDataOrRole === "string" ? userDataOrRole : userDataOrRole?.role;
  return role === "editor";
};

export const checkCanManageProducts = (userDataOrRole) => {
  return checkIsAdmin(userDataOrRole) || checkIsEditor(userDataOrRole);
};

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeDoc = null;

    const unsubAuth = auth.onAuthStateChanged((u) => {
      setUser(u);

      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }

      if (u) {
        const docRef = doc(db, "users", u.uid);
        unsubscribeDoc = onSnapshot(
          docRef,
          (docSnap) => {
            if (docSnap.exists()) {
              setUserData(docSnap.data());
            } else {
              setUserData(null);
            }
            setLoading(false);
          },
          (err) => {
            console.error("Error fetching user document:", err);
            setLoading(false);
          }
        );
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  const role = userData?.role || "user";
  const isAdmin = role === "admin";
  const isEditor = role === "editor";
  const canManageProducts = isAdmin || isEditor;

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        role,
        isAdmin,
        isEditor,
        canManageProducts,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
