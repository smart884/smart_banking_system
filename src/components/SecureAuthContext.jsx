import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db, auth as firebaseAuth } from '../lib/firebaseConfig';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  updateDoc, 
  doc, 
  setDoc,
  getDoc,
  getDocs,
  query, 
  where,
  orderBy, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';

// --- Secondary Firebase App for Admin User Creation ---
// This prevents the Admin from being logged out when creating other users.
const firebaseConfig = { 
  apiKey: "AIzaSyCRvpKllTWlf-g50S1KkGwShei2OWPK8qE", 
  authDomain: "smart-bank-47131.firebaseapp.com", 
  projectId: "smart-bank-47131", 
  storageBucket: "smart-bank-47131.firebasestorage.app", 
  messagingSenderId: "377827961253", 
  appId: "1:377827961253:web:00c7c4ba6d61c76f3d604c"
};

const secondaryApp = getApps().length > 1 ? getApp('Secondary') : initializeApp(firebaseConfig, 'Secondary');
const secondaryAuth = getAuth(secondaryApp);

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
  const [userProfile, setUserProfile] = useState(null);

  const [requests, setRequests] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [cards, setCards] = useState([]);
  const [loans, setLoans] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [systemSettings, setSystemSettings] = useState(null);
  const [userAccounts, setUserAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Listen for Auth Changes & Firestore Real-time Updates
  useEffect(() => {
    let unsubscribeProfile = () => {};

    // Set persistence to session (logs out when tab/browser is closed)
    setPersistence(firebaseAuth, browserSessionPersistence).catch(console.error);

    // Listen for Auth
    const unsubscribeAuth = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user) {
        try {
          // Fetch real profile from Firestore & set up a real-time listener for the current user's profile
          const userDocRef = doc(db, 'users', user.uid);
          unsubscribeProfile = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
              const profile = doc.data();
              setUserProfile({ ...profile, uid: user.uid });
              localStorage.setItem('sb_static_user', JSON.stringify({ ...profile, uid: user.uid }));
            } else {
              console.error("Auth user exists but no Firestore profile found for UID:", user.uid);
              setUserProfile(null);
              localStorage.removeItem('sb_static_user');
            }
            setLoading(false); // Move here to ensure profile is loaded or failed
          }, (err) => {
            console.error("Error listening for user profile:", err);
            setLoading(false);
          });
        } catch (err) {
          console.error("Error setting up user profile listener:", err);
          setUserProfile(null);
          setLoading(false);
        }
      } else {
        setUserProfile(null);
        localStorage.removeItem('sb_static_user');
        unsubscribeProfile();
        setLoading(false);
      }
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
      localStorage.setItem('sb_requests', JSON.stringify(fetchedRequests));
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
        localStorage.setItem('sb_service_requests', JSON.stringify(fetched));
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
      localStorage.setItem('sb_cards', JSON.stringify(fetched));
      console.log(`[Firebase] Synced ${fetched.length} cards for user ${userProfile.uid} 🔥`);
    });

    // Listen for Loan_tbl (Approved Loans)
    const loansRef = collection(db, 'Loan_tbl');
    const unsubscribeLoans = onSnapshot(query(loansRef, where('userId', '==', userProfile.uid)), (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        startDate: doc.data().startDate?.toDate?.()?.toISOString() || new Date().toISOString()
      }));
      setLoans(fetched);
      localStorage.setItem('sb_loans', JSON.stringify(fetched));
      console.log(`[Firebase] Synced ${fetched.length} loans for user ${userProfile.uid} 🔥`);
    });

    // Listen for Transactions
    const transactionsRef = collection(db, 'transactions');
    // Simplified query to avoid index requirements for now, filter/sort locally
    const qTransactions = query(
      transactionsRef, 
      where('userId', '==', userProfile.uid)
    );
    
    const unsubscribeTransactions = onSnapshot(qTransactions, (snapshot) => {
      const fetched = snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString()
        };
      }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      setTransactions(fetched);
      localStorage.setItem('sb_transactions', JSON.stringify(fetched));
      console.log(`[Firebase] Synced ${fetched.length} transactions for user ${userProfile.uid} 🔥`);
    });

    return () => {
      unsubscribe();
      unsubscribeService();
      unsubscribeCards();
      unsubscribeLoans();
      unsubscribeTransactions();
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
      localStorage.setItem('sb_user_accounts', JSON.stringify(fetchedAccounts));
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

      const profile = { 
        ...userDoc.data(), 
        uid: user.uid,
        role: userDoc.data().role?.toLowerCase() || 'customer'
      };
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
    const keysToRemove = [
      'sb_static_user', 
      'sb_is_logged', 
      'sb_requests', 
      'sb_service_requests', 
      'sb_cards', 
      'sb_loans', 
      'sb_transactions', 
      'sb_user_accounts'
    ];
    keysToRemove.forEach(k => localStorage.removeItem(k));
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
          
          // 2. Generate Loan if it's a loan request
          if (data.type?.toLowerCase()?.includes('loan')) {
            await generateLoan(data);
          }
          
          // 3. Update User Profile if it's a KYC Update
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
        const firstName = request.newName ? request.newName.trim().split(' ')[0] : userDoc.data().firstName;
        const lastName = request.newName ? request.newName.trim().split(' ').slice(1).join(' ') : userDoc.data().lastName;
        
        const updatePayload = {
          contactNumber: request.newMobile || request.mobile || userDoc.data().contactNumber,
          email: request.newEmail || request.email || userDoc.data().email,
          address: request.newAddress || request.address || userDoc.data().address,
          firstName,
          lastName,
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

  const generateLoan = async (request) => {
    try {
      const loanId = `L-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const loanData = {
        loanId,
        userId: request.userId,
        userName: request.userName || 'User',
        accountNumber: request.accountNumber || '',
        loanAmount: parseFloat(request.loanAmount || 0),
        tenure: parseInt(request.tenure || 12),
        emi: parseFloat(request.emi || 0),
        interestRate: request.interestRate || '10.5%',
        totalPayable: parseFloat(request.totalPayable || 0),
        remainingBalance: parseFloat(request.totalPayable || 0),
        paidAmount: 0,
        status: 'Active',
        startDate: serverTimestamp(),
        purpose: request.purpose || 'Personal',
        emiSchedule: Array.from({ length: parseInt(request.tenure || 12) }, (_, i) => {
          const dueDate = new Date();
          dueDate.setMonth(dueDate.getMonth() + i + 1);
          dueDate.setDate(1); // Set to 1st of each month for consistent due dates
          return {
            month: i + 1,
            amount: parseFloat(request.emi || 0),
            status: 'Pending',
            dueDate: dueDate.toISOString()
          };
        })
      };

      await addDoc(collection(db, 'Loan_tbl'), loanData);
      console.log(`[Banking] New Loan generated for ${request.userId} ✅`);
      
      // Also credit the amount to the user's account
      if (request.accountNumber) {
        const q = query(collection(db, 'accounts'), where('accountNumber', '==', request.accountNumber));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const accountDoc = snapshot.docs[0];
          const currentBalance = parseFloat(accountDoc.data().balance || 0);
          await updateDoc(doc(db, 'accounts', accountDoc.id), {
            balance: currentBalance + parseFloat(request.loanAmount || 0),
            lastTransactionDate: serverTimestamp()
          });
          console.log(`[Banking] Loan amount ₹${request.loanAmount} credited to ${request.accountNumber} ✅`);
        }
      }
    } catch (err) {
      console.error("[Banking] Loan generation failed:", err);
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
        userName: request.userName,
        details: {
          nomineeName: request.details?.nomineeName || 'Not Specified',
          nomineeRelation: request.details?.nomineeRelation || 'Not Specified'
        }
      };

      await addDoc(collection(db, 'accounts'), accountData);
      console.log(`[Banking] New account created: ${accountNum} for ${request.userName} ✅`);
    } catch (err) {
      console.error("[Banking] Account creation failed:", err);
    }
  };

  const performTransfer = async (transferData) => {
    try {
      const { fromAccountId, toAccountNumber, amount, remark } = transferData;
      
      // 1. Check sender balance
      const senderRef = doc(db, 'accounts', fromAccountId);
      const senderSnap = await getDoc(senderRef);
      if (!senderSnap.exists()) throw new Error('Sender account not found');
      const senderData = senderSnap.data();
      if (senderData.balance < amount) throw new Error('Insufficient balance');

      // 2. Find recipient account
      const accountsRef = collection(db, 'accounts');
      const q = query(accountsRef, where('accountNumber', '==', toAccountNumber));
      const recipientSnap = await getDocs(q);
      if (recipientSnap.empty) throw new Error('Recipient account not found');
      const recipientDoc = recipientSnap.docs[0];
      const recipientRef = doc(db, 'accounts', recipientDoc.id);
      const recipientData = recipientDoc.data();

      // 3. Update balances
      await updateDoc(senderRef, { balance: senderData.balance - amount });
      await updateDoc(recipientRef, { balance: recipientData.balance + amount });

      // 4. Record transactions
      const timestamp = serverTimestamp();
      
      // Sender's record (Debit)
      await addDoc(collection(db, 'transactions'), {
        userId: userProfile.uid,
        userName: `${userProfile.firstName} ${userProfile.lastName}`,
        type: 'Transfer',
        category: 'Debit',
        amount: -amount,
        fromAccount: senderData.accountNumber,
        toAccount: toAccountNumber,
        recipientName: recipientData.userName || 'Recipient',
        remark: remark || 'Fund Transfer',
        timestamp
      });

      // Recipient's record (Credit)
      await addDoc(collection(db, 'transactions'), {
        userId: recipientData.userId,
        userName: recipientData.userName || 'Unknown',
        type: 'Transfer',
        category: 'Credit',
        amount: amount,
        fromAccount: senderData.accountNumber,
        toAccount: toAccountNumber,
        senderName: `${userProfile.firstName} ${userProfile.lastName}`,
        remark: remark || 'Fund Transfer Received',
        timestamp
      });

      console.log(`[Banking] Transfer successful: ₹${amount} from ${senderData.accountNumber} to ${toAccountNumber} ✅`);
      return { success: true };
    } catch (err) {
      console.error("[Banking] Transfer failed:", err);
      return { success: false, message: err.message };
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
    loans,
    transactions,
    userAccounts,
    addRequest, 
        addCreditCardRequest,
        updateRequestStatus,
        updateServiceRequestStatus,
        initializeServiceMaster,
    performTransfer,
    performDeposit: async (depositData) => {
      try {
        const { accountId, amount, userName, userId, accountNumber } = depositData;
        
        // 1. Get Account
        const accRef = doc(db, 'accounts', accountId);
        const accSnap = await getDoc(accRef);
        if (!accSnap.exists()) throw new Error('Account not found');
        const accData = accSnap.data();

        // 2. Update Balance
        await updateDoc(accRef, {
          balance: accData.balance + parseFloat(amount),
          lastTransactionDate: serverTimestamp()
        });

        // 3. Record Transaction
        const timestamp = serverTimestamp();
        await addDoc(collection(db, 'transactions'), {
          userId: userId,
          userName: userName,
          type: 'Deposit',
          category: 'Credit',
          amount: parseFloat(amount),
          fromAccount: 'Self (Deposit)',
          toAccount: accountNumber,
          remark: 'Self Account Deposit (Clerk Approved)',
          timestamp
        });

        console.log(`[Banking] Deposit of ₹${amount} successful for account ${accountNumber} ✅`);
        return { success: true };
      } catch (err) {
        console.error("[Banking] Deposit failed:", err);
        return { success: false, message: err.message };
      }
    },
    performPayment: async (paymentData) => {
      try {
        const { fromAccountNumber, fromCardNumber, amount, type, remark, billCategory } = paymentData;
        
        let actualFromAccount = fromAccountNumber;
        let isCreditCard = false;
        let cardDocId = null;

        // 1. If card is source, resolve account or check credit limit
        if (fromCardNumber) {
          const cardRef = collection(db, 'Card_tbl');
          const cq = query(cardRef, where('cardNumber', '==', fromCardNumber));
          const cSnap = await getDocs(cq);
          if (cSnap.empty) throw new Error("Source card not found");
          
          const cardData = cSnap.docs[0].data();
          cardDocId = cSnap.docs[0].id;

          if (cardData.cardType === 'Debit') {
            actualFromAccount = cardData.accountNumber;
            if (!actualFromAccount) throw new Error("Debit card not linked to an account");
          } else {
            isCreditCard = true;
            const usedLimit = parseFloat(cardData.usedLimit || 0);
            const limit = parseFloat(cardData.limit || 0);
            if (usedLimit + amount > limit) throw new Error("Credit limit exceeded");
          }
        }

        if (!isCreditCard) {
          // 2. Find account by number (for direct account or debit card)
          const accountsRef = collection(db, 'accounts');
          const q = query(accountsRef, where('accountNumber', '==', actualFromAccount));
          const accSnapshot = await getDocs(q);
          if (accSnapshot.empty) throw new Error("Source account not found");
          
          const accDoc = accSnapshot.docs[0];
          const accData = accDoc.data();
          const accRef = doc(db, 'accounts', accDoc.id);

          // 3. Check balance
          if (accData.balance < amount) throw new Error("Insufficient balance");

          // 4. Update balance
          await updateDoc(accRef, {
            balance: accData.balance - amount,
            lastTransactionDate: serverTimestamp()
          });
        } else {
          // 2. Update Credit Card used limit
          const cardRef = doc(db, 'Card_tbl', cardDocId);
          const cardSnap = await getDoc(cardRef);
          const currentUsed = parseFloat(cardSnap.data().usedLimit || 0);
          await updateDoc(cardRef, {
            usedLimit: currentUsed + amount
          });
        }

        // 5. Record transaction in 'transactions' collection
        const timestamp = serverTimestamp();
        await addDoc(collection(db, 'transactions'), {
          userId: userProfile.uid,
          userName: `${userProfile.firstName} ${userProfile.lastName}`,
          type: type || 'Payment',
          category: 'Debit',
          amount: -amount,
          fromAccount: fromCardNumber ? `Card: ${fromCardNumber}` : actualFromAccount,
          toAccount: billCategory || 'System',
          remark: remark || 'Bill Payment',
          timestamp
        });

        console.log(`[Banking] Payment successful: ₹${amount} ${isCreditCard ? 'charged to credit card' : `debited from ${actualFromAccount}`} ✅`);
        return { success: true };
      } catch (err) {
        console.error("[Banking] Payment failed:", err);
        return { success: false, message: err.message };
      }
    },
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
        const { password, confirmPassword, ...profileData } = userData;
        
        // 1. Create user in Firebase Auth using secondary app to prevent Admin logout
        const userCredential = await createUserWithEmailAndPassword(
          secondaryAuth,
          userData.email,
          password
        );
        const user = userCredential.user;
        const normalizedRole = (userData.role || "customer").toLowerCase();

        // 2. Save full user data in Firestore 
        await setDoc(doc(db, "users", user.uid), { 
          uid: user.uid, 
          firstName: userData.firstName, 
          middleName: userData.middleName || "", 
          lastName: userData.lastName, 
          gender: userData.gender || "Male", 
          dob: userData.dob || "", 
          address1: userData.address1 || "", 
          address2: userData.address2 || "", 
          address3: userData.address3 || "", 
          pinCode: userData.pinCode || "", 
          contactNumber: userData.contact || "", 
          alternateNumber: userData.altContact || "", 
          email: userData.email, 
          aadhaar: userData.aadhaar || "", 
          pan: userData.pan || "", 
          occupation: userData.occupation || "",
          annualIncome: userData.annualIncome || "",
          nomineeName: userData.nomineeName || "",
          nomineeRelation: userData.nomineeRelation || "",
          userType: normalizedRole, 
          role: normalizedRole, 
          status: "Active", 
          kycStatus: "Pending",
          mobileVerified: false,
          emailVerified: false,
          createdAt: serverTimestamp() 
        }); 

        // 3. Immediately sign out from secondary app to keep it clean
        await signOut(secondaryAuth);
        
        console.log(`[Admin] User profile created for ${userData.email} with role ${normalizedRole} ✅`);
        return { success: true };
      } catch (err) {
        console.error("Failed to add user:", err);
        let message = err.message;
        if (err.code === 'auth/email-already-in-use') message = "This email is already in use.";
        if (err.code === 'auth/weak-password') message = "Password should be at least 6 characters.";
        return { success: false, message };
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
    },
    fetchLoanById: async (loanId) => {
      try {
        const cleanId = loanId.trim().toUpperCase();
        console.log(`[Banking] Searching for Loan ID: ${cleanId}...`);
        
        // 1. Search by loanId field
        const q = query(collection(db, 'Loan_tbl'), where('loanId', '==', cleanId));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          console.log(`[Banking] Loan found by loanId field ✅`);
          return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        }

        // 2. Fallback: Search by document ID (if it's a direct Firestore ID)
        // Note: Firestore IDs are case-sensitive and usually not prefixed with L-
        // but we check just in case the user provided a raw ID.
        const docRef = doc(db, 'Loan_tbl', loanId.trim());
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          console.log(`[Banking] Loan found by Document ID ✅`);
          return { id: docSnap.id, ...docSnap.data() };
        }

        console.warn(`[Banking] No loan found for ID: ${cleanId}`);
        return null;
      } catch (err) {
        console.error("Error fetching loan by ID:", err);
        return null;
      }
    },
    payLoanEMI: async (loanId, amount, fromAccountNum, fromCardNumber) => {
      try {
        const cleanId = loanId.trim().toUpperCase();
        // 1. Get Loan
        const q = query(collection(db, 'Loan_tbl'), where('loanId', '==', cleanId));
        let snapshot = await getDocs(q);
        
        let loanDoc, loanData, loanRef;
        if (!snapshot.empty) {
          loanDoc = snapshot.docs[0];
          loanData = loanDoc.data();
          loanRef = doc(db, 'Loan_tbl', loanDoc.id);
        } else {
          // Fallback to document ID
          const docRef = doc(db, 'Loan_tbl', loanId.trim());
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            loanDoc = docSnap;
            loanData = docSnap.data();
            loanRef = docRef;
          } else {
            throw new Error("Loan not found");
          }
        }

        let actualFromAccount = fromAccountNum;
        let isCreditCard = false;
        let cardDocId = null;

        // 2. Resolve Payment Source
        if (fromCardNumber) {
          const cardRef = collection(db, 'Card_tbl');
          const cq = query(cardRef, where('cardNumber', '==', fromCardNumber));
          const cSnap = await getDocs(cq);
          if (cSnap.empty) throw new Error("Source card not found");
          
          const cardData = cSnap.docs[0].data();
          cardDocId = cSnap.docs[0].id;

          if (cardData.cardType === 'Debit') {
            actualFromAccount = cardData.accountNumber;
            if (!actualFromAccount) throw new Error("Debit card not linked to an account");
          } else {
            isCreditCard = true;
            const usedLimit = parseFloat(cardData.usedLimit || 0);
            const limit = parseFloat(cardData.limit || 0);
            if (usedLimit + amount > limit) throw new Error("Credit limit exceeded");
          }
        }

        if (!isCreditCard) {
          // Find Account
          const accQ = query(collection(db, 'accounts'), where('accountNumber', '==', actualFromAccount));
          const accSnapshot = await getDocs(accQ);
          if (accSnapshot.empty) throw new Error("Source account not found");
          
          const accDoc = accSnapshot.docs[0];
          const accData = accDoc.data();
          const accRef = doc(db, 'accounts', accDoc.id);

          if (accData.balance < amount) throw new Error("Insufficient balance");

          // Update Balance
          await updateDoc(accRef, {
            balance: accData.balance - amount,
            lastTransactionDate: serverTimestamp()
          });
        } else {
          // Update Credit Card
          const cardRef = doc(db, 'Card_tbl', cardDocId);
          await updateDoc(cardRef, {
            usedLimit: (parseFloat(snapshot.docs[0]?.data()?.usedLimit || 0)) + amount
          });
        }

        // 4. Update Loan
        const newRemaining = Math.max(0, loanData.remainingBalance - amount);
        const newPaidAmount = (loanData.paidAmount || 0) + amount;
        
        // Find next pending EMI and mark as paid
        let markedPaid = false;
        const newSchedule = (loanData.emiSchedule || []).map(item => {
          if (!markedPaid && item.status === 'Pending' && amount >= item.amount) {
            markedPaid = true;
            return { ...item, status: 'Paid', paidAt: new Date().toISOString() };
          }
          return item;
        });

        await updateDoc(loanRef, {
          remainingBalance: newRemaining,
          paidAmount: newPaidAmount,
          emiSchedule: newSchedule,
          lastPaymentDate: serverTimestamp()
        });

        // 5. Record Transaction
        const timestamp = serverTimestamp();
        
        // Record in user_requests for tracking
        await addDoc(collection(db, 'user_requests'), {
          userId: userProfile.uid,
          userName: `${userProfile.firstName} ${userProfile.lastName}`,
          type: 'Loan EMI Payment',
          category: 'payment',
          status: 'approved',
          createdAt: timestamp,
          details: {
            fromAccount: fromCardNumber ? `Card: ${fromCardNumber}` : actualFromAccount,
            loanId: loanId,
            amount: amount,
            billCategory: 'loan-emi'
          }
        });

        // Record in transactions for history display
        await addDoc(collection(db, 'transactions'), {
          userId: userProfile.uid,
          userName: `${userProfile.firstName} ${userProfile.lastName}`,
          type: 'Loan EMI',
          category: 'Debit',
          amount: -amount,
          fromAccount: fromCardNumber ? `Card: ${fromCardNumber}` : actualFromAccount,
          toAccount: loanId,
          remark: `Loan EMI Payment: ${loanId}`,
          timestamp
        });

        return { success: true };
      } catch (err) {
        console.error("EMI Payment failed:", err);
        return { success: false, message: err.message };
      }
    },
    fetchCardByNumber: async (cardNumber) => {
      try {
        if (!cardNumber) return null;
        const cleanNumber = cardNumber.replace(/\D/g, ''); // Extract only digits
        if (cleanNumber.length === 0) return null;
        
        // Format to XXXX XXXX XXXX XXXX as it's stored in DB
        const parts = cleanNumber.match(/.{1,4}/g);
        const formattedNumber = parts ? parts.join(' ') : cleanNumber;
        
        console.log(`[Banking] Searching for Card: ${formattedNumber}...`);
        const q = query(collection(db, 'Card_tbl'), where('cardNumber', '==', formattedNumber));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          console.log(`[Banking] Card found ✅`);
          return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        }
        console.warn(`[Banking] No card found for number: ${formattedNumber}`);
        return null;
      } catch (err) {
        console.error("Error fetching card by number:", err);
        return null;
      }
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
