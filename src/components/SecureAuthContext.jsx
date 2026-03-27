import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db, auth as firebaseAuth } from '../lib/firebaseConfig';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  updateDoc, 
  doc, 
  getDoc,
  query, 
  orderBy, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';

/**
 * Firebase-Connected Unified Context
 * Stores and fetches requests directly from Cloud Firestore.
 * Clerk panel updates in real-time as users submit forms.
 */

const AuthContext = createContext(undefined);

const DUMMY_USER = {
  uid: 'dummy-123',
  email: 'user@smartbank.com',
  firstName: 'Smart',
  lastName: 'User',
  role: 'customer',
  userType: 'customer',
  status: 'pending'
};

export const AuthProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('sb_static_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Listen for Auth Changes & Firestore Real-time Updates
  useEffect(() => {
    // Listen for Auth
    const unsubscribeAuth = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user) {
        try {
          // Fetch real profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const profile = userDoc.data();
            setUserProfile(profile);
            localStorage.setItem('sb_static_user', JSON.stringify(profile));
          } else {
            // Fallback for demo: guess role from email if doc doesn't exist
            let role = 'customer';
            const emailLower = (user.email || '').toLowerCase();
            if (emailLower.includes('clerk')) role = 'clerk';
            else if (emailLower.includes('manager')) role = 'manager';
            else if (emailLower.includes('admin')) role = 'admin';

            const profile = { 
              ...DUMMY_USER, 
              email: user.email || '', 
              uid: user.uid,
              role: role,
              userType: role
            };
            setUserProfile(profile);
            localStorage.setItem('sb_static_user', JSON.stringify(profile));
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
        }
      } else {
        // Check if we have a static session
        const saved = localStorage.getItem('sb_static_user');
        if (!saved) setUserProfile(null);
      }
      setLoading(false);
    });

    // Listen for Firestore Requests (Real-time)
    const requestsRef = collection(db, 'user_requests');
    const q = query(requestsRef, orderBy('createdAt', 'desc'));

    const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
      const fetchedRequests = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetchedRequests.push({
          id: doc.id,
          userName: data.userName,
          type: data.type,
          category: data.category,
          details: data.details,
          status: data.status,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        });
      });
      setRequests(fetchedRequests);
      console.log(`[Firebase] Synced ${fetchedRequests.length} requests from Firestore 🔥`);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeFirestore();
    };
  }, []);

  const login = async (email, pass) => {
    try {
      setLoading(true);
      // Real Firebase Login
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, pass);
      const user = userCredential.user;
      
      // Fetch real profile from Firestore immediately after login
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const profile = userDoc.data();
        setUserProfile(profile);
        localStorage.setItem('sb_static_user', JSON.stringify(profile));
      } else {
        // Fallback for demo: guess role from email if doc doesn't exist
        let role = 'customer';
        const emailLower = email.toLowerCase();
        if (emailLower.includes('clerk')) role = 'clerk';
        else if (emailLower.includes('manager')) role = 'manager';
        else if (emailLower.includes('admin')) role = 'admin';

        const profile = { 
          ...DUMMY_USER, 
          email: user.email || '', 
          uid: user.uid,
          role: role,
          userType: role
        };
        setUserProfile(profile);
        localStorage.setItem('sb_static_user', JSON.stringify(profile));
      }
      
      localStorage.setItem('sb_is_logged', 'true');
      return profile.role; // Return role for redirection
    } catch (err) {
      console.error("Login failed:", err.message);
      // Fallback for local testing if Firebase fails
      let role = 'customer';
      const emailLower = email.toLowerCase();
      if (emailLower.includes('clerk')) role = 'clerk';
      else if (emailLower.includes('manager')) role = 'manager';
      else if (emailLower.includes('admin')) role = 'admin';

      const profile = { 
        ...DUMMY_USER, 
        email, 
        role: role,
        userType: role
      };
      setUserProfile(profile);
      localStorage.setItem('sb_static_user', JSON.stringify(profile));
      return profile.role; // Return role for redirection
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(firebaseAuth);
    setUserProfile(null);
    localStorage.removeItem('sb_static_user');
    localStorage.removeItem('sb_is_logged');
  };

  const addRequest = async (req) => {
    try {
      console.log("[Firebase] Saving request to Firestore...");
      
      await addDoc(collection(db, 'user_requests'), {
        ...req,
        status: 'pending',
        createdAt: serverTimestamp(),
        userId: userProfile?.uid || 'anonymous'
      });
      
      console.log(`[Firebase] Request saved to Firestore successfully! ✅`);
    } catch (err) {
      console.error("[Firebase] CRITICAL: Failed to save to Firestore:", err);
      // Local fallback if Firebase fails
      const newReq = { ...req, id: `LOCAL-${Date.now()}`, status: 'pending', createdAt: new Date().toISOString() };
      setRequests(prev => [newReq, ...prev]);
      alert("Note: Request saved locally as Firebase is offline.");
    }
  };

  const updateRequestStatus = async (id, status) => {
    try {
      const docRef = doc(db, 'user_requests', id);
      await updateDoc(docRef, { status });
      console.log(`[Firebase] Status updated in Firestore: ${id} -> ${status} 🔥`);
    } catch (err) {
      console.error("[Firebase] Update failed:", err);
    }
  };

  const value = {
    currentUser: userProfile,
    userProfile,
    loading,
    login,
    logout,
    requests,
    addRequest,
    updateRequestStatus,
    forceSync: () => {}, // Handled by onSnapshot
    clearRequests: () => {
      console.warn("Bulk clear not allowed on Firestore via client.");
    },
    populateDemoData: async () => {
      // Add one demo doc to firestore
      await addRequest({
        userName: 'System Demo',
        type: 'Open Saving Account',
        category: 'account',
        details: { fullName: 'Rahul Demo', deposit: '1000' }
      });
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
