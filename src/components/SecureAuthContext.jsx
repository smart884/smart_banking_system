import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db, auth as firebaseAuth } from '../lib/firebaseConfig';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  updateDoc, 
  doc, 
  getDoc,
  getDocs,
  query, 
  where,
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
  const [serviceRequests, setServiceRequests] = useState([]); // Added for ServiceRequest_tbl
  const [cards, setCards] = useState([]); // Added for Card_tbl
  const [allUsers, setAllUsers] = useState([]);
  const [systemSettings, setSystemSettings] = useState(null);
  const [userAccounts, setUserAccounts] = useState([]);
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

    // Initialize ServiceMaster
    initializeServiceMaster();

    return () => {
      unsubscribeAuth();
      unsubscribeUsers();
      unsubscribeSettings();
    };
  }, []);

  // Listen for Firestore Requests (Real-time) - Filtered for current user
  useEffect(() => {
    if (!userProfile?.uid) {
      setRequests([]);
      return;
    }

    const requestsRef = collection(db, 'user_requests');
    let q;

    // If not an admin/clerk/manager, only show their own requests
    const rawRole = userProfile?.role || userProfile?.userType || 'customer';
    const role = rawRole.toLowerCase();
    
    // Check if staff
    const isStaff = role === 'clerk' || role === 'manager' || role === 'admin' || 
                   role === 'bank officer' || role === 'regional manager';

    const fullName = `${userProfile?.firstName} ${userProfile?.lastName}`.trim();

    if (isStaff) {
      q = query(requestsRef, orderBy('createdAt', 'desc'));
    } else {
      // NOTE: We don't use 'or' query here to maintain compatibility with basic Firestore setups
      // Instead, we fetch all and filter in the snapshot to ensure privacy while supporting old data (by name)
      q = query(requestsRef, orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRequests = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // PRIVACY FILTER: If not staff, only allow their own records
        if (!isStaff) {
          const isOwner = (data.userId === userProfile.uid) || (data.userName === fullName);
          if (!isOwner) return;
        }

        fetchedRequests.push({
          id: doc.id,
          userId: data.userId,
          userName: data.userName,
          type: data.type,
          category: data.category,
          details: data.details,
          status: data.status,
          clerkRemark: data.clerkRemark,
          managerRemark: data.managerRemark,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        });
      });
      setRequests(fetchedRequests);
      console.log(`[Firebase] Synced ${fetchedRequests.length} requests for ${role || 'user'} ${userProfile.uid} 🔥`);
    });

    // Listen for ServiceRequest_tbl (Credit Card Requests)
    const serviceRequestsRef = collection(db, 'ServiceRequest_tbl');
    const unsubscribeService = onSnapshot(
      query(serviceRequestsRef, orderBy('createdAt', 'desc')), 
      (snapshot) => {
        const fetched = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          // PRIVACY FILTER: If not staff, only allow their own records
          if (!isStaff) {
            if (data.userId !== userProfile.uid) return;
          }
          fetched.push({ id: doc.id, ...data, createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString() });
        });
        setServiceRequests(fetched);
        console.log(`[Firebase] Synced ${fetched.length} service requests for role: ${role} 🔥`);
      },
      (error) => {
        console.error("[Firebase] ServiceRequest listener failed:", error);
      }
    );

    // Listen for Card_tbl (Approved Cards)
    const cardsRef = collection(db, 'Card_tbl');
    const unsubscribeCards = onSnapshot(query(cardsRef, where('userId', '==', userProfile.uid)), (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCards(fetched);
      console.log(`[Firebase] Synced ${fetched.length} cards for user ${userProfile.uid} 🔥`);
    });

    return () => {
      unsubscribe();
      unsubscribeService();
      unsubscribeCards();
    };
  }, [userProfile?.uid, userProfile?.role]);

  // Listen for current user's accounts
  useEffect(() => {
    if (!userProfile?.uid) {
      setUserAccounts([]);
      return;
    }

    const accountsRef = collection(db, 'accounts');
    const q = query(accountsRef, where('userId', '==', userProfile.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedAccounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserAccounts(fetchedAccounts);
      console.log(`[Firebase] Synced ${fetchedAccounts.length} accounts for user ${userProfile.uid} 🔥`);
    });

    return () => unsubscribe();
  }, [userProfile?.uid]);

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
        userId: userProfile?.uid || userProfile?.id || 'anonymous' // Ensure userId is always attached
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

  const addCreditCardRequest = async (req) => {
    try {
      console.log("[Firebase] Saving Credit Card request...");
      await addDoc(collection(db, 'ServiceRequest_tbl'), {
        ...req,
        status: 'P', // Pending
        userId: userProfile?.uid,
        createdAt: serverTimestamp()
      });
      console.log(`[Firebase] Credit Card request saved successfully! ✅`);
      return { success: true };
    } catch (err) {
      console.error("[Firebase] Error adding Credit Card request:", err);
      throw err; // Re-throw so the UI can handle it
    }
  };

  const updateServiceRequestStatus = async (id, status, remarks = '') => {
    try {
      const docRef = doc(db, 'ServiceRequest_tbl', id);
      const updateData = { status };
      
      const rawRole = userProfile?.role || userProfile?.userType || 'customer';
      const role = rawRole.toLowerCase();
      
      if (role === 'clerk' || role === 'bank officer') {
        updateData.clerkRemark = remarks;
      } else if (role === 'manager' || role === 'regional manager') {
        updateData.managerRemark = remarks;
      }

      await updateDoc(docRef, updateData);
      console.log(`[Firebase] ServiceRequest status updated: ${id} -> ${status} 🔥`);

      // Special Logic for specific service types if needed
      if (status === 'S') { // Solved / Approved
        const reqDoc = await getDoc(docRef);
        if (reqDoc.exists()) {
          const data = reqDoc.data();
          
          // 1. Generate card if it's a card request
          if (data.type?.toLowerCase()?.includes('card')) {
            await generateCreditCard(data);
          }
          
          // 2. Update User Profile if it's a KYC Update
          if (data.type === 'KYC Update' || data.type === 'KYC Document Update') {
            await updateUserProfileFromKYC(data);
          }
        }
      }
    } catch (err) {
      console.error("[Firebase] ServiceRequest update failed:", err);
    }
  };

  const updateUserProfileFromKYC = async (request) => {
    try {
      // Find user document in 'users' collection by uid
      const q = query(collection(db, 'users'), where('uid', '==', request.userId));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        const userRef = doc(db, 'users', userDoc.id);
        
        // Update user profile with new details from KYC request
        // Handling both old and new field formats for compatibility
        const updatePayload = {
          contactNumber: request.newMobile || request.mobile || userDoc.data().contactNumber,
          email: request.newEmail || request.email || userDoc.data().email,
          address: request.newAddress || request.address || userDoc.data().address,
          firstName: request.newName ? request.newName.split(' ')[0] : userDoc.data().firstName,
          lastName: request.newName ? request.newName.split(' ').slice(1).join(' ') : userDoc.data().lastName,
          kycStatus: 'Verified',
          lastKycUpdate: serverTimestamp()
        };
        
        await updateDoc(userRef, updatePayload);
        console.log(`[Compliance] User profile updated for ${request.userId} from KYC Request ✅`);
      }
    } catch (err) {
      console.error("[Compliance] User profile update failed:", err);
    }
  };

  const generateCreditCard = async (request) => {
    try {
      const isDebit = request.type === 'Debit Card Request';
      
      // 16-digit card number (4 groups of 4)
      const cardNumber = Array.from({ length: 4 }, () => 
        Math.floor(1000 + Math.random() * 9000)).join(' ');
      
      // 3-digit CVV
      const cvv = Math.floor(100 + Math.random() * 900).toString();
      
      // Expiry (3 years from now)
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 3);
      const expiry = `${(expiryDate.getMonth() + 1).toString().padStart(2, '0')}/${expiryDate.getFullYear().toString().slice(-2)}`;

      // Credit limit based on card type
      let limit = 0;
      if (!isDebit) {
        limit = 50000; // Default to Basic
        if (request.cardType === 'Platinum') limit = 100000;
        if (request.cardType === 'Gold') limit = 150000;
      }

      const cardData = {
        userId: request.userId,
        userName: request.fullName || 'User',
        cardNumber,
        cvv,
        expiry,
        limit,
        cardType: isDebit ? 'Debit' : 'Credit',
        category: isDebit ? request.cardType : 'Credit', // Classic or Platinum for Debit
        accountNumber: request.accountNumber || '',
        status: 'Active',
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'Card_tbl'), cardData);
      console.log(`[Banking] New ${isDebit ? 'Debit' : 'Credit'} Card generated for ${request.userId} ✅`);
    } catch (err) {
      console.error("[Banking] Card generation failed:", err);
    }
  };

  const initializeServiceMaster = async () => {
    try {
      const services = [
        { name: 'Credit Card Request', desc: 'Apply for a new credit card based on your monthly income.' },
        { name: 'Debit Card Request', desc: 'Apply for a new debit card for instant access.' },
        { name: 'Personal Loan Request', desc: 'Apply for a personal loan with flexible tenure.' },
        { name: 'KYC Update', desc: 'Update your identification documents and personal records.' }
      ];

      for (const service of services) {
        const q = query(collection(db, 'ServiceMaster_tbl'), where('name', '==', service.name));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          await addDoc(collection(db, 'ServiceMaster_tbl'), {
            name: service.name,
            description: service.desc,
            category: 'service',
            status: 'Active',
            createdAt: serverTimestamp()
          });
          console.log(`[Firebase] ServiceMaster initialized with ${service.name} ✅`);
        }
      }
    } catch (err) {
      console.error("[Firebase] Error initializing ServiceMaster:", err);
    }
  };

  const updateRequestStatus = async (id, status, remarks = '') => {
    try {
      const docRef = doc(db, 'user_requests', id);
      const updateData = { status };
      
      // Add remarks based on role (Case-insensitive)
      const rawRole = userProfile?.role || userProfile?.userType || 'customer';
      const role = rawRole.toLowerCase();
      
      if (role === 'clerk' || role === 'bank officer') {
        updateData.clerkRemark = remarks;
      } else if (role === 'manager' || role === 'regional manager') {
        updateData.managerRemark = remarks;
      }

      await updateDoc(docRef, updateData);
      console.log(`[Firebase] Status updated in Firestore: ${id} -> ${status} 🔥`);

      // If Manager Approved, trigger Account Creation
      if (status === 'manager_approved') {
        const reqDoc = await getDoc(docRef);
        if (reqDoc.exists()) {
          const reqData = reqDoc.data();
          await createAccountFromRequest(reqData);
          // Mark as fully processed
          await updateDoc(docRef, { status: 'approved' });
        }
      }
    } catch (err) {
      console.error("[Firebase] Update failed:", err);
    }
  };

  const createAccountFromRequest = async (request) => {
    try {
      const accountNum = `SB-${Math.random().toString().slice(2, 14)}`; // 12-digit random account number
      const ifsc = "SMBK0001024"; // Static bank branch IFSC
      
      const accountData = {
        userId: request.userId,
        accountNumber: accountNum,
        accountType: request.details?.accountType || 'saving',
        balance: parseFloat(request.details?.deposit || 0),
        minimumBalance: request.details?.accountType === 'saving' ? 500 : 2000,
        ifsc,
        branchName: "Smart Bank Main Branch",
        status: 'Active',
        lastTransactionDate: serverTimestamp(),
        createdAt: serverTimestamp(),
        userName: request.userName
      };

      await addDoc(collection(db, 'accounts'), accountData);
      console.log(`[Banking] New account created: ${accountNum} for ${request.userName} ✅`);
    } catch (err) {
      console.error("[Banking] Account creation failed:", err);
    }
  };

  const value = {
    currentUser: userProfile,
    userProfile,
    loading,
    login,
    logout,
    requests,
    serviceRequests,
    cards,
    userAccounts,
    addRequest, 
        addCreditCardRequest,
        updateRequestStatus,
        updateServiceRequestStatus,
        initializeServiceMaster,
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
          createdAt: serverTimestamp(),
          role: userData.role || 'customer',
          kycStatus: 'Pending',
          mobileVerified: false,
          emailVerified: false
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
    forceSync: () => {},
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
