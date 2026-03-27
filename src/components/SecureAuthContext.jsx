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
  const [allUsers, setAllUsers] = useState([]);
  const [systemSettings, setSystemSettings] = useState(null);
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
            setUserProfile({ ...profile, uid: user.uid });
            localStorage.setItem('sb_static_user', JSON.stringify({ ...profile, uid: user.uid }));
          } else {
            // CRITICAL: If no Firestore profile exists, the user is effectively invalid
            // for our banking system even if they exist in Firebase Auth.
            console.error("Auth user exists but no Firestore profile found for UID:", user.uid);
            setUserProfile(null);
            localStorage.removeItem('sb_static_user');
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
        localStorage.removeItem('sb_static_user');
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
          userId: data.userId, // Added userId
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

    // Listen for Firestore Users (Real-time)
    const usersRef = collection(db, 'users');
    const unsubscribeUsers = onSnapshot(usersRef, (snapshot) => {
      const fetchedUsers = [];
      snapshot.forEach((doc) => {
        fetchedUsers.push({ id: doc.id, ...doc.data() });
      });
      setAllUsers(fetchedUsers);
    });

    // Listen for System Settings (Real-time)
    const settingsRef = doc(db, 'system_settings', 'global');
    const unsubscribeSettings = onSnapshot(settingsRef, (doc) => {
      if (doc.exists()) {
        setSystemSettings(doc.data());
      } else {
        // Default settings
        setSystemSettings({
          ipWhitelisting: true,
          twoFactorAuth: true,
          sslTls: true,
          dataEncryption: true
        });
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeFirestore();
      unsubscribeUsers();
      unsubscribeSettings();
    };
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const user = userCredential.user;

      // 2. Double-check if a profile exists for this user in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        throw new Error('user-not-found');
      }

      const profile = { ...userDoc.data(), uid: user.uid };
      setUserProfile(profile);
      localStorage.setItem('sb_static_user', JSON.stringify(profile));

      return { success: true, profile };
    } catch (error) {
      console.error("[Auth] Login error:", error.code || error.message);
      
      // Translate Firebase errors to user-friendly messages
      let message = "Invalid credentials. Please try again.";
      if (error.code === 'auth/user-not-found' || error.message === 'user-not-found') {
        message = "No account found with this email.";
      } else if (error.code === 'auth/wrong-password') {
        message = "Incorrect password.";
      } else if (error.code === 'auth/invalid-email') {
        message = "Invalid email format.";
      } else if (error.code === 'auth/too-many-requests') {
        message = "Too many failed attempts. Please try later.";
      }

      return { success: false, message };
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
    allUsers,
    systemSettings,
    updateSystemSettings: async (newSettings) => {
      try {
        const docRef = doc(db, 'system_settings', 'global');
        await updateDoc(docRef, newSettings);
      } catch (err) {
        console.error("Failed to update system settings:", err);
      }
    },
    addUser: async (userData) => {
      try {
        await addDoc(collection(db, 'users'), {
          ...userData,
          status: 'Active',
          createdAt: serverTimestamp()
        });
      } catch (err) {
        console.error("Failed to add user:", err);
      }
    },
    deleteUser: async (id) => {
      try {
        // We can't easily delete from Auth via client, but we can delete from Firestore
        // or just mark as deleted. For simplicity in this demo, we'll delete the Firestore doc.
        // In a real app, you'd use a Cloud Function.
        const { deleteDoc } = await import('firebase/firestore');
        await deleteDoc(doc(db, 'users', id));
      } catch (err) {
        console.error("Failed to delete user:", err);
      }
    },
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
