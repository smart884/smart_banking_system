import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/SecureAuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  User as UserIcon, 
  Send,
  CreditCard,
  PlusCircle,
  Receipt,
  Smartphone,
  Briefcase,
  FileText,
  ShieldCheck,
  Eye,
  EyeOff,
  Landmark,
  CheckCircle2,
  X,
  ArrowRight,
  PieChart,
  Layout as LayoutIcon,
  CreditCard as CardIcon,
  LogOut,
  Bell,
  Search,
  Sparkles,
  Zap,
  FileCheck,
  UserPlus,
  Clock,
  Database,
  ChevronRight,
  Check,
  Loader2
} from 'lucide-react';

import Modal from '../components/ui/Modal';

// Constants for Credit Card Bill Flow
const CC_BANKS = ["SmartBank", "HDFC Bank", "ICICI Bank", "SBI Card", "Axis Bank", "Amex"];

const MOCK_CC_DETAILS = {
  totalAmount: 12450.75,
  minDue: 622.54,
  dueDate: "15-Apr-2026",
  outstanding: 45200.00
};

// Constants for Loan EMI Flow
const MOCK_LOAN_DETAILS = {
  loanId: "AD14235346457567",
  emiAmount: 25000,
  dueDate: "25-Mar-2026", // Past date to simulate penalty
  penaltyRate: 0.02, // 2% penalty
  lateFee: 500,
  loanHolder: "John Doe",
  totalLoanAmount: 5000000,
  interestAmount: 1250000,
  totalPayable: 6250000,
  remainingBalance: 4250000
};

// Constants for Electricity Bill Flow
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const ELECTRICITY_BOARDS = {
  "Gujarat": ["Torrent Power", "GIFT Power Company Limited", "PGVCL", "MGVCL", "DGVCL", "UGVCL"],
  "Maharashtra": ["MSEDCL (Mahadiscom)", "Tata Power - Mumbai", "Adani Electricity", "BEST"],
  "Delhi": ["BSES Rajdhani", "BSES Yamuna", "Tata Power DDL"],
  "Karnataka": ["BESCOM", "MESCOM", "HESCOM", "GESCOM"],
  "Tamil Nadu": ["TANGEDCO"],
  "Uttar Pradesh": ["UPPCL (Urban)", "UPPCL (Rural)", "NPCL"],
  // Add more as needed, defaulting others to a generic list for simulation
};

const BOARD_CITIES = {
  "Torrent Power": ["Ahmedabad", "Surat", "Bhiwandi", "Agra"],
  "GIFT Power Company Limited": ["GIFT City, Gandhinagar"],
  "PGVCL": ["Rajkot", "Jamnagar", "Bhavnagar", "Junagadh"],
  "MGVCL": ["Vadodara", "Anand", "Nadiad"],
  "DGVCL": ["Surat", "Bharuch", "Valsad"],
  "UGVCL": ["Mehsana", "Palanpur", "Gandhinagar"],
  "MSEDCL (Mahadiscom)": ["Pune", "Nagpur", "Thane", "Nashik"],
  "Tata Power - Mumbai": ["Mumbai"],
  "Adani Electricity": ["Mumbai Suburban"],
  "BEST": ["Mumbai City"],
  "BSES Rajdhani": ["South Delhi", "West Delhi"],
  "BSES Yamuna": ["East Delhi", "Central Delhi"],
  "Tata Power DDL": ["North Delhi", "North West Delhi"],
  "BESCOM": ["Bangalore", "Tumkur", "Kolar"],
  "TANGEDCO": ["Chennai", "Coimbatore", "Madurai"],
  "UPPCL (Urban)": ["Lucknow", "Kanpur", "Varanasi"],
  "Generic Power Distribution": ["Main City", "Other City"]
};

// Constants for Mobile Recharge Flow
const MOBILE_PROVIDERS = [
  { name: "Airtel", color: "#E40000", lightColor: "#FFEBEE" },
  { name: "BSNL", color: "#0054A6", lightColor: "#E3F2FD" },
  { name: "JIO", color: "#005EB8", lightColor: "#E1F5FE" },
  { name: "MTNL", color: "#F47920", lightColor: "#FFF3E0" },
  { name: "VI", color: "#EE1D23", lightColor: "#FBE9E7" }
];

const RECHARGE_PLANS = {
  "Airtel": [
    { id: 'a1', price: 239, data: '1.5GB/Day', validity: '28 Days', type: 'Unlimited Calling' },
    { id: 'a2', price: 299, data: '2GB/Day', validity: '28 Days', type: 'Unlimited Calling' },
    { id: 'a3', price: 666, data: '1.5GB/Day', validity: '84 Days', type: 'Unlimited Calling' },
    { id: 'a4', price: 2999, data: '2GB/Day', validity: '365 Days', type: 'Unlimited Calling' },
    { id: 'a5', price: 155, data: '1GB Total', validity: '24 Days', type: 'Talktime + Data' }
  ],
  "BSNL": [
    { id: 'b1', price: 107, data: '3GB Total', validity: '35 Days', type: 'Talktime' },
    { id: 'b2', price: 197, data: '2GB/Day', validity: '70 Days', type: 'Talktime' },
    { id: 'b3', price: 397, data: '2GB/Day', validity: '150 Days', type: 'Talktime' },
    { id: 'b4', price: 797, data: '2GB/Day', validity: '300 Days', type: 'Talktime' }
  ],
  "JIO": [
    { id: 'j1', price: 239, data: '1.5GB/Day', validity: '28 Days', type: 'True 5G Unlimited' },
    { id: 'j2', price: 299, data: '2GB/Day', validity: '28 Days', type: 'True 5G Unlimited' },
    { id: 'j3', price: 666, data: '1.5GB/Day', validity: '84 Days', type: 'True 5G Unlimited' },
    { id: 'j4', price: 749, data: '2GB/Day', validity: '90 Days', type: 'True 5G Unlimited' },
    { id: 'j5', price: 2999, data: '2.5GB/Day', validity: '365 Days', type: 'Annual Plan' }
  ],
  "MTNL": [
    { id: 'm1', price: 151, data: '1GB/Day', validity: '28 Days', type: 'Data Plan' },
    { id: 'm2', price: 251, data: '2GB/Day', validity: '28 Days', type: 'Data Plan' },
    { id: 'm3', price: 98, data: '2GB Total', validity: '22 Days', type: 'Talktime' }
  ],
  "VI": [
    { id: 'v1', price: 299, data: '1.5GB/Day', validity: '28 Days', type: 'Binge All Night' },
    { id: 'v2', price: 479, data: '1.5GB/Day', validity: '56 Days', type: 'Binge All Night' },
    { id: 'v3', price: 719, data: '1.5GB/Day', validity: '84 Days', type: 'Binge All Night' },
    { id: 'v4', price: 1799, data: '24GB Total', validity: '365 Days', type: 'Annual' }
  ]
};

const MOCK_CONTACTS = [
  { name: 'Self', number: '9876543210' },
  { name: 'Mom', number: '9823456789' },
  { name: 'Dad', number: '9821234567' },
  { name: 'Sister', number: '9123456780' },
  { name: 'Kashish', number: '9123456781' },
  { name: 'Dhruvi', number: '9123456782' }
];

export default function SecureDashboard() {
  const { userProfile, logout, addRequest, requests, userAccounts } = useAuth(); // Added userAccounts
  const [showBalance, setShowBalance] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedAccount, setSelectedAccount] = useState(null); // State for account details modal
  const [transferSuccess, setTransferSuccess] = useState(false); // Success animation state
  const [billStep, setBillStep] = useState(1); // Specific sub-steps for Electricity Bill
  const [checkingBill, setCheckingBill] = useState(false); // Bill verification loading state
  const [billFound, setBillFound] = useState(null); // null: not checked, true: found, false: no due
  const [billAmount, setBillAmount] = useState(0); // Mock bill amount found
  const [rechargeStep, setRechargeStep] = useState(1); // Steps for Mobile Recharge
  const [rechargeSearch, setRechargeSearch] = useState(''); // Contact/Plan search query
  const [selectedPlan, setSelectedPlan] = useState(null); // Selected recharge plan details
  const [ccStep, setCcStep] = useState(1); // 1: Details, 2: Success/Failure
  const [ccPaymentStatus, setCcPaymentStatus] = useState(null); // 'success' or 'failure'
  const [loanStep, setLoanStep] = useState(1); // 1: Entry, 2: Success
  const [loanStatus, setLoanStatus] = useState(null); // 'success' or 'failure'

  // Filter requests for current user (Support both UID and Name for backward compatibility)
  const userRequests = requests.filter(req => 
    req.userId === userProfile?.uid || 
    (!req.userId && req.userName === `${userProfile?.firstName} ${userProfile?.lastName}`)
  );
  
  // Helper to get Date object from various timestamp formats
  const getDateObject = (ts) => {
    if (!ts) return new Date();
    return ts.toDate ? ts.toDate() : new Date(ts);
  };

  // Helper to format account dates correctly
  const formatAccountDate = (ts) => {
    const date = getDateObject(ts);
    return isNaN(date.getTime()) ? 'Recently' : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Helper to generate deterministic account numbers for pending/approved requests
  const getSimulatedAccNum = (id) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i);
      hash |= 0;
    }
    return `SB-${Math.abs(hash).toString().padEnd(12, '0').slice(0, 12)}`;
  };

  // Legacy support: Requests marked as 'approved' but not yet in the official 'accounts' collection
  const approvedRequests = userRequests.filter(req => 
    req.category === 'account' && (req.status === 'approved' || req.status === 'clerk_approved' || req.status === 'manager_approved')
  );
  
  // Combine official accounts and approved requests for display in Accounts tab
  const allAccounts = [
    ...userAccounts.map(acc => {
      const accNum = acc.accountNumber;
      
      // Calculate real-time balance for this official account
      const totalSent = userRequests
        .filter(req => (req.category === 'transfer' || req.category === 'payment') && 
          ['approved', 'pending', 'pending_clerk', 'clerk_approved', 'manager_approved'].includes(req.status.toLowerCase()) && 
          req.details?.fromAccount === accNum)
        .reduce((sum, req) => sum + parseFloat(req.details?.amount || 0), 0);
        
      const totalReceived = userRequests
        .filter(req => req.category === 'transfer' && 
          ['approved', 'pending', 'pending_clerk', 'clerk_approved', 'manager_approved'].includes(req.status.toLowerCase()) && 
          req.details?.recipient === accNum)
        .reduce((sum, req) => sum + parseFloat(req.details?.amount || 0), 0);

      return {
        id: acc.id,
        accountNumber: accNum,
        accountType: acc.accountType,
        balance: parseFloat(acc.balance || 0) - totalSent + totalReceived,
        createdAt: acc.createdAt,
        status: 'Active',
        isOfficial: true,
        userName: acc.userName || `${userProfile?.firstName} ${userProfile?.lastName}`
      };
    }),
    ...approvedRequests.map(req => {
      const accNum = getSimulatedAccNum(req.id);
      
      // Calculate real-time balance for this simulated account
      const totalSent = userRequests
        .filter(r => (r.category === 'transfer' || r.category === 'payment') && 
          ['approved', 'pending', 'pending_clerk', 'clerk_approved', 'manager_approved'].includes(r.status.toLowerCase()) && 
          r.details?.fromAccount === accNum)
        .reduce((sum, r) => sum + parseFloat(r.details?.amount || 0), 0);
        
      const totalReceived = userRequests
        .filter(r => r.category === 'transfer' && 
          ['approved', 'pending', 'pending_clerk', 'clerk_approved', 'manager_approved'].includes(r.status.toLowerCase()) && 
          r.details?.recipient === accNum)
        .reduce((sum, r) => sum + parseFloat(r.details?.amount || 0), 0);

      return {
        id: req.id,
        accountNumber: accNum,
        accountType: req.details?.accountType || 'Saving',
        balance: parseFloat(req.details?.deposit || 0) - totalSent + totalReceived,
        createdAt: req.createdAt,
        status: 'Approved',
        isOfficial: false,
        details: req.details,
        userName: req.userName || `${userProfile?.firstName} ${userProfile?.lastName}`
      };
    })
  ];

  // Prepare real transaction history from user requests
  const transactionHistory = userRequests
    .filter(req => ['account', 'transfer', 'payment'].includes(req.category))
    .flatMap(req => {
      let amountVal = parseFloat(req.details?.amount || req.details?.deposit || 0);
      let status = req.status === 'pending_clerk' ? 'Clerk Review' : 
                   req.status === 'clerk_approved' ? 'Manager Review' : 
                   req.status.charAt(0).toUpperCase() + req.status.slice(1);
      
      const entries = [];
      const userAccountNums = allAccounts.map(a => a.accountNumber);

      if (req.category === 'account') {
        entries.push({
          id: `${req.id}-credit`,
          name: `Initial Deposit (${req.details?.accountType || 'Saving'})`,
          date: formatAccountDate(req.createdAt),
          rawDate: req.createdAt,
          amount: `+₹${amountVal.toLocaleString()}`,
          amountVal,
          status,
          icon: '🏦',
          isNegative: false,
          toAccountNum: getSimulatedAccNum(req.id),
          category: 'account'
        });
      } else if (req.category === 'transfer') {
        const fromAcc = req.details?.fromAccount || 'Unknown';
        const toAcc = req.details?.recipient || 'Unknown';
        const isSelfTransfer = userAccountNums.includes(toAcc);
        
        // Debit Entry (Money leaving source account)
        entries.push({
          id: `${req.id}-debit`,
          name: `${fromAcc} to ${isSelfTransfer ? toAcc : (req.details?.recipientName || toAcc || 'Unknown')}`,
          date: formatAccountDate(req.createdAt),
          rawDate: req.createdAt,
          amount: `-₹${amountVal.toLocaleString()}`,
          amountVal,
          status,
          icon: '💸',
          isNegative: true,
          fromAccountNum: fromAcc,
          toAccountNum: toAcc,
          category: 'transfer'
        });

        // Credit Entry (Money entering destination account if it's mine)
        if (isSelfTransfer) {
          entries.push({
            id: `${req.id}-credit`,
            name: `${fromAcc} to ${toAcc}`,
            date: formatAccountDate(req.createdAt),
            rawDate: req.createdAt,
            amount: `+₹${amountVal.toLocaleString()}`,
            amountVal,
            status,
            icon: '💸',
            isNegative: false,
            fromAccountNum: fromAcc,
            toAccountNum: toAcc,
            category: 'transfer'
          });
        }
      } else if (req.category === 'payment') {
        const fromAcc = req.details?.fromAccount || 'Unknown';
        const billCat = req.details?.billCategory;
        const billName = billCat ? `${billCat.charAt(0).toUpperCase() + billCat.slice(1)}` : 'Bill';
        
        entries.push({
          id: `${req.id}-debit`,
          name: `${fromAcc} to ${billName}`,
          date: formatAccountDate(req.createdAt),
          rawDate: req.createdAt,
          amount: `-₹${amountVal.toLocaleString()}`,
          amountVal,
          status,
          icon: '🧾',
          isNegative: true,
          fromAccountNum: fromAcc,
          category: 'payment'
        });
      }

      return entries;
    })
    .sort((a, b) => {
       const dateA = getDateObject(a.rawDate);
       const dateB = getDateObject(b.rawDate);
       return dateB.getTime() - dateA.getTime();
     });

  // Calculate real Inflow and Outflow
  const totalInflow = transactionHistory
    .filter(tx => !tx.isNegative && ['approved', 'Approved', 'Manager Review', 'Clerk Review', 'Pending'].includes(tx.status))
    .reduce((sum, tx) => sum + tx.amountVal, 0);
  
  const totalOutflow = transactionHistory
    .filter(tx => tx.isNegative && ['approved', 'Approved', 'Manager Review', 'Clerk Review', 'Pending'].includes(tx.status))
    .reduce((sum, tx) => sum + tx.amountVal, 0);

  // Calculate real total balance: Sum of all inflows minus sum of all outflows
  const totalBalance = totalInflow - totalOutflow;

  const [modal, setModal] = useState({
    isOpen: false,
    type: '',
    title: ''
  });

  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formStep, setFormStep] = useState(1);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const openModal = (type, title) => {
    setModal({ isOpen: true, type, title });
    setFormData({});
    setSubmitting(false);
    setFormError('');
    setFormStep(1);
    setBillStep(1);
    setBillFound(null);
    setBillAmount(0);
    setCheckingBill(false);
    setRechargeStep(1);
    setRechargeSearch('');
    setSelectedPlan(null);
    setCcStep(1);
    setCcPaymentStatus(null);
  };

  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
    setSubmitting(false);
    setFormError('');
    setFormStep(1);
    setBillStep(1);
    setBillFound(null);
    setBillAmount(0);
    setCheckingBill(false);
    setRechargeStep(1);
    setRechargeSearch('');
    setSelectedPlan(null);
    setCcStep(1);
    setCcPaymentStatus(null);
  };

  // Mock function to "Check Bill"
  const handleCheckBill = (e) => {
    e.preventDefault();
    if (!formData.serviceNum || !formData.city || !formData.state || !formData.board) {
      setFormError('Please fill in all mandatory fields.');
      return;
    }
    
    setCheckingBill(true);
    setFormError('');
    
    // Simulate bill check delay
    setTimeout(() => {
      setCheckingBill(false);
      // Mock logic: If service number ends in '0', no bill found. Otherwise, random bill.
      if (formData.serviceNum.endsWith('0')) {
        setBillFound(false);
      } else {
        setBillFound(true);
        // Random amount between 500 and 5000
        const mockAmt = Math.floor(Math.random() * 4500) + 500;
        setBillAmount(mockAmt);
        setFormData(prev => ({ ...prev, amount: mockAmt }));
      }
      setBillStep(2); // Show the result
    }, 1500);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      // Reset dependent fields in electricity flow
      if (name === 'state') updated.board = '';
      if (name === 'board' || name === 'state') updated.city = '';
      
      // Credit Card Flow Logic
      if (name === 'ccAmountOption') {
        if (value === 'total') updated.amount = MOCK_CC_DETAILS.totalAmount;
        else if (value === 'min') updated.amount = MOCK_CC_DETAILS.minDue;
        else updated.amount = '';
      }
      
      // Reset flows if category changes
      if (name === 'billCategory') {
        setRechargeStep(1);
        setRechargeSearch('');
        setSelectedPlan(null);
        setCcStep(1);
        setCcPaymentStatus(null);
        setLoanStep(1);
        setLoanStatus(null);
        updated.refNum = '';
        updated.amount = '';
        updated.provider = '';
        updated.rechargeType = '';
        updated.ccAmountOption = 'total';
        updated.bankName = '';
        updated.cardHolder = '';
        
        if (value === 'credit-card') {
          updated.ccAmountOption = 'total';
          updated.amount = MOCK_CC_DETAILS.totalAmount;
        } else if (value === 'loan-emi') {
          updated.amount = MOCK_LOAN_DETAILS.emiAmount + MOCK_LOAN_DETAILS.lateFee;
          // Clear loan holder on category change, wait for ID input
          updated.cardHolder = '';
        }
      }

      // Auto-fetch Loan details if ID matches
      if (name === 'refNum' && prev.billCategory === 'loan-emi') {
        if (value === MOCK_LOAN_DETAILS.loanId) {
          updated.cardHolder = MOCK_LOAN_DETAILS.loanHolder;
        } else {
          updated.cardHolder = '';
        }
      }
      
      return updated;
    });
    if (formError) setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // VALIDATION: New Account Request
    if (modal.type === 'new-account') {
      // Step 1 Validation: Account Selection
      if (formStep === 1) {
        if (!formData.mobile || !/^\d{10}$/.test(formData.mobile)) {
          setFormError('Please enter a valid 10-digit mobile number.');
          return;
        }
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setFormError('Please enter a valid email address.');
          return;
        }
        const deposit = parseFloat(formData.deposit);
        if (isNaN(deposit) || deposit < 500) {
          setFormError('Initial deposit must be at least ₹500.');
          return;
        }
        if (formData.accountType === 'current' && (!formData.gst || !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gst.toUpperCase()))) {
          setFormError('Please enter a valid 15-digit GSTIN for Current Account.');
          return;
        }
        setFormStep(2);
        return;
      }

      // Step 2 Validation: Personal & Identity
      if (formStep === 2) {
        // Occupation and Annual Income are only required for Current Accounts
        if (formData.accountType === 'current') {
          if (!formData.occupation || !formData.annualIncome) {
            setFormError('Please fill in all identity details.');
            return;
          }
        }
        
        if (!formData.aadhar || !/^\d{12}$/.test(formData.aadhar)) {
          setFormError('Please enter a valid 12-digit Aadhaar number.');
          return;
        }
        if (!formData.pan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan.toUpperCase())) {
          setFormError('Please enter a valid PAN card number.');
          return;
        }
        setFormStep(3);
        return;
      }

      // Step 3 Validation: Nominee & Finalize
      if (formStep === 3) {
        if (!formData.nomineeName || !formData.nomineeRelation) {
          setFormError('Nominee details are mandatory for banking requests.');
          return;
        }
      }
    }

    // Transfer & Bill Payment Logic & Validation
    if (modal.type === 'transfer' || modal.type === 'bill-pay') {
      if (!formData.fromAccount || !formData.amount) {
        setFormError('Source account and amount are required.');
        return;
      }
      
      const sourceAcc = allAccounts.find(acc => acc.accountNumber === formData.fromAccount);
      const paymentAmt = parseFloat(formData.amount);
      
      if (!sourceAcc) {
        setFormError('Source account not found.');
        return;
      }
      
      if (paymentAmt <= 0) {
        setFormError('Amount must be greater than zero.');
        return;
      }

      if (paymentAmt > sourceAcc.balance) {
        setFormError(`Insufficient funds! Your ${sourceAcc.accountType} account only has ₹${sourceAcc.balance}.`);
        return;
      }

      if (modal.type === 'transfer' && !formData.recipient) {
        setFormError('Recipient is required.');
        return;
      }
    }

    setSubmitting(true);
    console.log(`[USER-DASHBOARD] Submitting ${modal.type}...`, formData);
    
    const userName = `${userProfile?.firstName || 'User'} ${userProfile?.lastName || ''}`.trim();
    
    // Categorize based on modal type
    let category = 'service';
    if (modal.type === 'new-account') category = 'account';
    if (modal.type === 'transfer') category = 'transfer';
    if (modal.type === 'bill-pay') category = 'payment';

    // Fund Transfer Success Animation & Auto-Approval
    if (modal.type === 'transfer' || modal.type === 'bill-pay') {
      setTimeout(() => {
        addRequest({
          userId: userProfile?.uid,
          userName,
          type: modal.title,
          category,
          details: formData,
          status: 'approved' // Self & verified transfers/payments are auto-approved for balance deduction
        }).then(() => {
          if (modal.type === 'transfer') setTransferSuccess(true);
          setTimeout(() => {
            showToast(`${modal.type === 'transfer' ? `₹${formData.amount} transferred` : 'Bill paid'} successfully! ✅`);
            closeModal();
            setTransferSuccess(false);
          }, 2000);
        }).finally(() => {
          setSubmitting(false);
        });
      }, 1500); // Simulated processing time
      return;
    }

    addRequest({
      userId: userProfile?.uid, // Added userId for better tracking
      userName,
      type: modal.title,
      category,
      details: formData,
      status: category === 'account' ? 'pending_clerk' : 'pending' // Account requests follow strict workflow
    }).then(() => {
      showToast(`${modal.title} request submitted successfully!`);
      closeModal();
    }).finally(() => {
      setSubmitting(false);
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            {/* Global Action Grid - Based on Use Case Diagram */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6 mb-12">
              {/* Use Case: Request New Account */}
              <button onClick={() => openModal('new-account', 'Request New Account')} className="group relative bg-blue-600 rounded-[32px] p-6 xl:p-8 text-white shadow-2xl shadow-blue-200 overflow-hidden hover:-translate-y-2 transition-all duration-500">
                <div className="absolute top-0 right-0 p-10 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 xl:w-16 xl:h-16 bg-white/20 backdrop-blur-md rounded-2xl xl:rounded-3xl flex items-center justify-center mb-6 ring-1 ring-white/30">
                    <UserPlus className="w-6 h-6 xl:w-8 xl:h-8" />
                  </div>
                  <p className="text-base xl:text-lg font-black tracking-tight mb-1">New Account</p>
                  <p className="text-blue-100 text-[10px] xl:text-sm font-medium">Saving, Current, FD</p>
                </div>
              </button>

              {/* Use Case: Fund Transfer */}
              <button onClick={() => openModal('transfer', 'Fund Transfer')} className="group relative bg-white rounded-[32px] p-6 xl:p-8 text-slate-900 shadow-xl border border-slate-100 overflow-hidden hover:-translate-y-2 transition-all duration-500">
                <div className="relative z-10">
                  <div className="w-12 h-12 xl:w-16 xl:h-16 bg-slate-50 rounded-2xl xl:rounded-3xl flex items-center justify-center mb-6 border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                    <Send className="w-6 h-6 xl:w-8 xl:h-8 text-blue-600" />
                  </div>
                  <p className="text-base xl:text-lg font-black tracking-tight mb-1">Fund Transfer</p>
                  <p className="text-slate-500 text-[10px] xl:text-sm font-medium">Debit or Credit</p>
                </div>
              </button>

              {/* Use Case: Pay Bills / Recharge */}
              <button onClick={() => openModal('bill-pay', 'Pay Bills / Recharge')} className="group relative bg-white rounded-[32px] p-6 xl:p-8 text-slate-900 shadow-xl border border-slate-100 overflow-hidden hover:-translate-y-2 transition-all duration-500">
                <div className="relative z-10">
                  <div className="w-12 h-12 xl:w-16 xl:h-16 bg-slate-50 rounded-2xl xl:rounded-3xl flex items-center justify-center mb-6 border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                    <Zap className="w-6 h-6 xl:w-8 xl:h-8 text-blue-600" />
                  </div>
                  <p className="text-base xl:text-lg font-black tracking-tight mb-1">Bills & Recharge</p>
                  <p className="text-slate-500 text-[10px] xl:text-sm font-medium">Utility, Mobile, EMI</p>
                </div>
              </button>

              {/* Use Case: Request Services */}
              <button onClick={() => openModal('request-services', 'Request Services')} className="group relative bg-slate-900 rounded-[32px] p-6 xl:p-8 text-white shadow-2xl overflow-hidden hover:-translate-y-2 transition-all duration-500">
                <div className="absolute top-0 right-0 p-10 bg-blue-500/20 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 xl:w-16 xl:h-16 bg-white/10 backdrop-blur-md rounded-2xl xl:rounded-3xl flex items-center justify-center mb-6 ring-1 ring-white/20">
                    <Briefcase className="w-6 h-6 xl:w-8 xl:h-8 text-blue-400" />
                  </div>
                  <p className="text-base xl:text-lg font-black tracking-tight mb-1">Services</p>
                  <p className="text-slate-400 text-[10px] xl:text-sm font-medium">Cards, Loans, KYC</p>
                </div>
              </button>
            </section>

            {/* Dynamic Account Stats & Assets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8 mb-12">
              {/* Main Wallet Card - Use Case: Check Balance */}
              <div className="lg:col-span-2 space-y-6 xl:space-y-8">
                <div className="bg-white rounded-[32px] xl:rounded-[48px] p-8 xl:p-12 shadow-xl border border-slate-50 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-32 bg-blue-600/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                  
                  <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-8 xl:gap-10">
                    <div>
                      <div className="flex items-center gap-3 mb-4 xl:mb-6">
                        <div className="w-8 h-8 xl:w-10 xl:h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                          <Wallet className="w-4 h-4 xl:w-5 xl:h-5" />
                        </div>
                        <span className="text-[10px] xl:text-sm font-black text-slate-400 uppercase tracking-widest">Global Account Balance</span>
                      </div>
                      <div className="flex items-end gap-4">
                        <h2 className="text-5xl xl:text-7xl font-black text-slate-900 tracking-tighter leading-none">
                          {showBalance ? `₹${totalBalance.toLocaleString()}` : '••••••'}
                        </h2>
                        <button 
                          onClick={() => setShowBalance(!showBalance)}
                          className="mb-1 xl:mb-2 p-2 xl:p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                        >
                          {showBalance ? <EyeOff className="w-5 h-5 xl:w-6 xl:h-6" /> : <Eye className="w-5 h-5 xl:w-6 xl:h-6" />}
                        </button>
                      </div>
                      <div className="mt-6 xl:mt-8 flex items-center gap-4">
                        <span className="bg-green-100 text-green-700 px-3 xl:px-4 py-1.5 xl:py-2 rounded-full text-[10px] xl:text-xs font-black uppercase tracking-widest">+12.4% THIS MONTH</span>
                        <span className="text-slate-400 text-xs xl:text-sm font-medium italic">Updated 2 mins ago</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 xl:gap-4 min-w-[180px] xl:min-w-[200px]">
                      <div className="p-4 xl:p-6 bg-slate-50 rounded-2xl xl:rounded-[32px] border border-slate-100 flex items-center gap-4">
                        <div className="w-10 h-10 xl:w-12 xl:h-12 bg-white rounded-xl xl:rounded-2xl flex items-center justify-center text-green-500 shadow-sm">
                          <ArrowUpRight className="w-5 h-5 xl:w-6 xl:h-6" />
                        </div>
                        <div>
                          <p className="text-[8px] xl:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Inflow</p>
                          <p className="text-base xl:text-lg font-black text-slate-900 leading-none mt-1">₹{totalInflow.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="p-4 xl:p-6 bg-slate-50 rounded-2xl xl:rounded-[32px] border border-slate-100 flex items-center gap-4">
                        <div className="w-10 h-10 xl:w-12 xl:h-12 bg-white rounded-xl xl:rounded-2xl flex items-center justify-center text-red-500 shadow-sm">
                          <ArrowDownLeft className="w-5 h-5 xl:w-6 xl:h-6" />
                        </div>
                        <div>
                          <p className="text-[8px] xl:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Outflow</p>
                          <p className="text-base xl:text-lg font-black text-slate-900 leading-none mt-1">₹{totalOutflow.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Transactions Table - Use Case: Transaction History */}
                <div className="bg-white rounded-[32px] xl:rounded-[40px] shadow-xl border border-slate-50 overflow-hidden">
                  <div className="p-6 xl:p-8 border-b border-slate-50 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl xl:text-2xl font-black text-slate-900 tracking-tight">Transaction History</h3>
                      <p className="text-xs xl:text-sm font-medium text-slate-500 mt-1">Detailed history across all protocols</p>
                    </div>
                    <button onClick={() => setActiveTab('history')} className="px-5 xl:px-6 py-2.5 xl:py-3 bg-slate-50 hover:bg-slate-100 rounded-xl xl:rounded-2xl text-[10px] xl:text-xs font-black text-slate-900 tracking-widest transition-all">VIEW ALL</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <tbody className="divide-y divide-slate-50">
                        {transactionHistory.length > 0 ? (
                          transactionHistory.slice(0, 5).map((tx, idx) => (
                            <tr key={tx.id || idx} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                              <td className="py-5 xl:py-6 px-8 xl:px-10">
                                <div className="flex items-center gap-4 xl:gap-5">
                                  <div className={`w-12 h-12 xl:w-14 xl:h-14 rounded-xl xl:rounded-2xl flex items-center justify-center text-xl xl:text-2xl group-hover:scale-110 transition-transform ${
                                    !tx.isNegative ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                                  }`}>{tx.icon}</div>
                                  <div>
                                    <p className="text-sm xl:text-base font-black text-slate-900">{tx.name}</p>
                                    <p className="text-[10px] xl:text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">{tx.date}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-5 xl:py-6 px-8 xl:px-10 text-right">
                                <div className="flex flex-col items-end">
                                  <p className={`text-base xl:text-xl font-black ${!tx.isNegative ? 'text-emerald-600' : 'text-slate-900'}`}>{tx.amount}</p>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="2" className="py-16 xl:py-20 text-center">
                              <History size={32} className="text-slate-200 mx-auto mb-4" />
                              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">No transactions yet</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column: Cards & Promotions */}
              <div className="space-y-6 xl:space-y-8">
                {/* Premium Card Display */}
                <div className="relative group perspective-1000 cursor-pointer" onClick={() => setActiveTab('cards')}>
                  <div className="absolute inset-0 bg-blue-600/20 blur-[60px] rounded-full scale-75 group-hover:scale-100 transition-transform duration-700" />
                  <div className="relative bg-slate-900 aspect-[1.6/1] rounded-[32px] xl:rounded-[40px] p-8 xl:p-10 text-white overflow-hidden shadow-2xl transition-all duration-700 hover:rotate-y-12 hover:scale-[1.02]">
                    <div className="absolute top-0 right-0 p-32 bg-gradient-to-br from-blue-600/40 to-transparent rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                    
                    <div className="relative h-full flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Infinite Wealth</p>
                          <h4 className="text-xl font-black italic tracking-tighter">SmartBank Black</h4>
                        </div>
                        <div className="w-12 h-12 xl:w-14 xl:h-14 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-blue-600 transition-colors">
                          <Landmark size={24} className="text-white" />
                        </div>
                      </div>

                      <div className="space-y-6 xl:space-y-8">
                        <div className="flex gap-4 xl:gap-6">
                          <span className="text-xl xl:text-2xl font-black tracking-[0.2em]">••••</span>
                          <span className="text-xl xl:text-2xl font-black tracking-[0.2em]">••••</span>
                          <span className="text-xl xl:text-2xl font-black tracking-[0.2em]">••••</span>
                          <span className="text-xl xl:text-2xl font-black tracking-[0.2em]">8842</span>
                        </div>
                        
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[8px] xl:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Card Holder</p>
                            <p className="text-sm xl:text-base font-black tracking-tight uppercase">{userProfile?.firstName} {userProfile?.lastName}</p>
                          </div>
                          <div className="flex -space-x-3 xl:-space-x-4">
                            <div className="w-10 h-10 xl:w-12 xl:h-12 bg-rose-500/80 rounded-full backdrop-blur-md" />
                            <div className="w-10 h-10 xl:w-12 xl:h-12 bg-amber-500/80 rounded-full backdrop-blur-md" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Promotions / Ad Unit */}
                <div className="bg-gradient-to-br from-indigo-600 to-blue-800 rounded-[32px] xl:rounded-[40px] p-8 xl:p-10 text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                  <div className="relative z-10">
                    <div className="w-12 h-12 xl:w-14 xl:h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 ring-1 ring-white/30 group-hover:scale-110 transition-transform">
                      <Zap size={28} />
                    </div>
                    <h4 className="text-xl xl:text-2xl font-black leading-tight mb-3">Earn up to 7.5% APY on Savings</h4>
                    <p className="text-blue-100 text-sm font-medium mb-6">Open a High-Yield Savings Account today and watch your money grow faster.</p>
                    <button className="w-full py-4 bg-white text-blue-700 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl">Apply Now</button>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      case 'accounts':
        return (
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Your Accounts</h2>
                <p className="text-slate-500 font-medium text-lg mt-2">Manage your verified bank accounts and assets.</p>
              </div>
              <button onClick={() => openModal('new-account', 'Request New Account')} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-3">
                <PlusCircle size={20} /> Open New Account
              </button>
            </div>

            {allAccounts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {allAccounts.map((acc, idx) => (
                  <div key={acc.id} className="group bg-white rounded-[40px] p-10 shadow-xl border border-slate-100 hover:border-blue-200 transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-20 bg-blue-600/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-10">
                        <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                          <Landmark size={32} />
                        </div>
                        <span className={`px-4 py-2 ${acc.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-blue-100 text-blue-700 border-blue-200'} rounded-full text-[10px] font-black uppercase tracking-widest border`}>
                          {acc.status}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Account Number</p>
                        <p className="text-2xl font-black text-slate-900 tracking-tight">
                          {acc.accountNumber || `SB-${acc.id.substring(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`}
                        </p>
                      </div>

                      <div className="mt-8 grid grid-cols-2 gap-8">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</p>
                          <p className="font-bold text-slate-900 uppercase">{acc.accountType || 'Saving'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance</p>
                          <p className="text-xl font-black text-blue-600">₹{parseFloat(acc.balance || 0).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Opened: {formatAccountDate(acc.createdAt)}</p>
                        <button 
                          onClick={() => setSelectedAccount(acc)}
                          className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest hover:gap-4 transition-all"
                        >
                          Details <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-slate-200">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-300">
                  <FileText size={48} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">No Active Accounts Found</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-10">Once your account request is approved by the bank clerk and manager, it will appear here instantly.</p>
                <button onClick={() => openModal('new-account', 'Request New Account')} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-all">
                  Request New Account
                </button>
              </div>
            )}

            {/* Pending & Rejected Requests Section */}
            {userRequests.some(r => ['pending', 'rejected', 'pending_clerk', 'clerk_approved'].includes(r.status)) && (
              <div className="mt-16">
                <div className="flex items-center gap-4 px-2 mb-8">
                  <div className="w-1.5 h-8 bg-amber-500 rounded-full" />
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Application Status</h3>
                </div>
                <div className="space-y-4">
                  {userRequests.filter(r => r.status === 'pending' || r.status === 'rejected' || r.status === 'pending_clerk' || r.status === 'clerk_approved').map(req => (
                    <div key={req.id} className="bg-white rounded-3xl p-6 border border-slate-100 flex flex-col gap-4 shadow-sm hover:border-blue-200 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className={`w-12 h-12 ${req.status === 'rejected' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'} rounded-2xl flex items-center justify-center`}>
                            {req.status === 'rejected' ? <X size={24} /> : <Clock size={24} />}
                          </div>
                          <div>
                            <p className="font-black text-slate-900">{req.type} ({req.details?.accountType || 'Saving'})</p>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">Submitted: {formatAccountDate(req.createdAt)}</p>
                          </div>
                        </div>
                        <span className={`px-4 py-2 ${
                          req.status === 'rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                        } rounded-full text-[10px] font-black uppercase tracking-widest`}>
                          {req.status === 'rejected' ? 'Rejected' : 
                           req.status === 'clerk_approved' ? 'Manager Review' : 'Awaiting Review'}
                        </span>
                      </div>
                      
                      {/* Clerk Remarks if available */}
                      {req.clerkRemark && (
                        <div className="p-4 bg-rose-50/50 rounded-2xl border-l-4 border-rose-500">
                          <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Bank Message:</p>
                          <p className="text-sm font-bold text-slate-700 italic">"{req.clerkRemark}"</p>
                        </div>
                      )}

                      {/* Manager Remarks if available */}
                      {req.managerRemark && (
                        <div className="p-4 bg-rose-50/50 rounded-2xl border-l-4 border-rose-500">
                          <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Manager Note:</p>
                          <p className="text-sm font-bold text-slate-700 italic">"{req.managerRemark}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'cards':
        return (
          <div className="space-y-10">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">My Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[40px] p-10 h-[280px] shadow-2xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 p-32 bg-blue-600/20 rounded-full blur-[80px] -mr-24 -mt-24"></div>
                <div className="relative z-10 flex justify-between items-start text-white">
                  <span className="text-[10px] font-black tracking-[0.3em] uppercase">SmartBank Black</span>
                  <div className="w-12 h-8 bg-yellow-500/20 border border-yellow-500/30 rounded" />
                </div>
                <div className="relative z-10 text-white">
                  <p className="text-xl font-mono tracking-[0.3em] mb-6">•••• •••• •••• 8842</p>
                  <div className="flex justify-between items-end">
                    <p className="text-sm font-bold uppercase tracking-widest">{userProfile?.firstName} {userProfile?.lastName}</p>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" className="h-8 opacity-80" alt="Mastercard" />
                  </div>
                </div>
              </div>
              <button onClick={() => openModal('request-services', 'Request New Card')} className="border-2 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center gap-4 hover:border-blue-400 hover:bg-blue-50 transition-all p-10">
                <PlusCircle size={40} className="text-slate-300" />
                <p className="font-black text-slate-400 uppercase tracking-widest">Add New Card</p>
              </button>
            </div>
          </div>
        );
      case 'payments':
        return (
          <div className="space-y-10">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter text-left">Payment Center</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <button onClick={() => openModal('bill-pay', 'Utility Bill Payment')} className="p-10 bg-white rounded-[40px] shadow-xl border border-slate-100 flex flex-col items-center gap-6 hover:-translate-y-2 transition-all">
                <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600"><Zap size={40} /></div>
                <p className="font-black text-slate-900 uppercase tracking-widest">Utility Bills</p>
              </button>
              <button onClick={() => openModal('transfer', 'Send Money')} className="p-10 bg-white rounded-[40px] shadow-xl border border-slate-100 flex flex-col items-center gap-6 hover:-translate-y-2 transition-all">
                <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center text-green-600"><Send size={40} /></div>
                <p className="font-black text-slate-900 uppercase tracking-widest">Transfers</p>
              </button>
              <button onClick={() => openModal('bill-pay', 'Mobile Recharge')} className="p-10 bg-white rounded-[40px] shadow-xl border border-slate-100 flex flex-col items-center gap-6 hover:-translate-y-2 transition-all">
                <div className="w-20 h-20 bg-purple-50 rounded-3xl flex items-center justify-center text-purple-600"><Smartphone size={40} /></div>
                <p className="font-black text-slate-900 uppercase tracking-widest">Recharge</p>
              </button>
            </div>
            <div className="bg-white rounded-[40px] shadow-xl border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50"><h3 className="text-xl font-black text-slate-900">Recent Payments</h3></div>
              <div className="p-10 text-center text-slate-400 font-medium">No recent payments found.</div>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-10">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Financial Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-[40px] p-10 shadow-xl border border-slate-100">
                <h3 className="text-xl font-black text-slate-900 mb-8">Spending Analysis</h3>
                <div className="space-y-6">
                  {[
                    { label: 'Shopping', amount: '₹45,000', color: 'bg-blue-600', width: '65%' },
                    { label: 'Food & Dining', amount: '₹12,400', color: 'bg-emerald-500', width: '25%' },
                    { label: 'Utilities', amount: '₹8,200', color: 'bg-amber-500', width: '15%' },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-2">
                        <span className="font-bold text-slate-900">{item.label}</span>
                        <span className="font-black text-slate-900">{item.amount}</span>
                      </div>
                      <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: item.width }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-900 rounded-[40px] p-10 text-white shadow-2xl">
                <h3 className="text-xl font-black mb-8">Wealth Growth</h3>
                <div className="h-48 flex items-end gap-2">
                  {[40, 60, 45, 80, 55, 90, 70].map((h, i) => (
                    <div key={i} className="flex-1 bg-blue-500 rounded-t-lg transition-all hover:bg-blue-400 cursor-pointer" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className="mt-6 flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'history':
        return (
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Financial Statement</h2>
                <p className="text-slate-500 font-medium text-lg mt-2">Complete record of all credits and debits.</p>
              </div>
              <button onClick={() => setActiveTab('dashboard')} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all flex items-center gap-3">
                <LayoutIcon size={20} /> Back to Overview
              </button>
            </div>

            <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] w-[60%]">Transaction Details</th>
                      <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] w-[40%] text-right">Transaction Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {transactionHistory.length > 0 ? (
                      transactionHistory.map((tx, idx) => (
                        <tr key={tx.id || idx} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="py-8 px-10">
                            <div className="flex items-center gap-6">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-sm ${
                                !tx.isNegative ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {tx.icon}
                              </div>
                              <div>
                                <p className="text-base font-black text-slate-900">{tx.name}</p>
                                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{tx.date}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-8 px-10 text-right">
                            <div className="flex flex-col items-end">
                              <p className={`text-2xl font-black tracking-tighter ${!tx.isNegative ? 'text-emerald-600' : 'text-slate-900'}`}>
                                {tx.amount}
                              </p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                {tx.isNegative ? 'Debit' : 'Credit'}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="py-32 text-center">
                          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <History size={32} className="text-slate-300" />
                          </div>
                          <p className="text-slate-400 font-black uppercase tracking-widest italic">No transaction history found.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-white rounded-[40px] p-20 text-center border border-slate-100 shadow-sm">
            <h2 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tighter">{activeTab}</h2>
            <p className="text-slate-500 font-medium text-lg">This module is currently under secure maintenance.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top duration-500">
          <div className="bg-slate-900 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 border border-slate-800 backdrop-blur-xl bg-opacity-90">
            <div className="bg-blue-500 rounded-full p-1">
              <CheckCircle2 size={16} className="text-white" />
            </div>
            <span className="font-bold tracking-tight">{toast}</span>
          </div>
        </div>
      )}

      {/* Modern Sidebar Navigation */}
      <aside className="fixed left-0 top-0 bottom-0 w-80 bg-slate-900 text-white border-r border-slate-800 z-50 p-8 hidden xl:flex flex-col">
        <div className="flex items-center gap-4 mb-16 px-2">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/20 overflow-hidden border border-slate-700">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white uppercase">Smart<span className="text-blue-600">Bank</span></span>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutIcon, label: 'Overview' },
            { id: 'accounts', icon: Landmark, label: 'Accounts' },
            { id: 'cards', icon: CardIcon, label: 'My Cards' },
            { id: 'payments', icon: Receipt, label: 'Payments' },
            { id: 'analytics', icon: PieChart, label: 'Insights' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={22} className={activeTab === item.id ? 'text-white' : 'group-hover:scale-110 transition-transform text-slate-400 group-hover:text-white'} />
              <span className="font-bold tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-slate-800 space-y-4">
          <div className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700 group hover:border-blue-500/50 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-blue-400 shadow-sm">
                <ShieldCheck size={20} />
              </div>
              <span className="font-bold text-sm text-white">Premium Plan</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">Unlock advanced analytics and higher limits with Pro.</p>
            <button className="w-full py-3 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-all">UPGRADE NOW</button>
          </div>

          <button onClick={logout} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all group">
            <LogOut size={22} className="group-hover:translate-x-1 transition-transform" />
            <span className="font-bold tracking-tight text-sm uppercase tracking-widest">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 xl:ml-80 p-6 sm:p-10 lg:p-12 xl:p-14 max-w-[1800px] mx-auto w-full">
        {/* Modern Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2 text-blue-600">
              <Sparkles size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Personal Banking Dashboard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none">
              Welcome back, <span className="text-blue-600">{userProfile?.firstName || 'User'}</span>
            </h1>
            <p className="mt-2 text-slate-500 font-medium text-base">Your financial ecosystem is performing optimally today.</p>
          </div>

          <div className="flex items-center gap-4">
            <button className="w-12 h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-100 hover:shadow-lg transition-all relative">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>
            <div className="flex items-center gap-3 bg-white border border-slate-100 p-1.5 pr-5 rounded-xl shadow-sm">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                <UserIcon size={20} />
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Tier Status</p>
                <p className="text-xs font-bold text-slate-900 mt-1">Elite Customer</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Content */}
        {renderTabContent()}
      </main>

      {/* Reusable Action Modals - Based on Use Case Diagram */}
      <Modal 
        isOpen={modal.isOpen} 
        onClose={closeModal} 
        title={modal.title}
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          {formError && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold animate-in fade-in slide-in-from-top-2">
              {formError}
            </div>
          )}

          {/* Multi-step Logic for New Account */}
          {modal.type === 'new-account' ? (
            <div className="space-y-8">
              {/* Step Indicator */}
              <div className="flex items-center justify-between px-4 mb-10">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${formStep >= step ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400'}`}>
                      {step}
                    </div>
                    {step < 3 && <div className={`w-12 h-1 ${formStep > step ? 'bg-blue-600' : 'bg-slate-100'} rounded-full`} />}
                  </div>
                ))}
              </div>

              {/* STEP 1: Account Selection */}
              {formStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="label">Account Type</label>
                      <select name="accountType" onChange={handleInputChange} value={formData.accountType || ''} className="input" required>
                        <option value="">Select type</option>
                        <option value="saving">Saving Account</option>
                        <option value="current">Current Account</option>
                        <option value="fd">Fixed Deposit</option>
                        <option value="joint">Joint Account</option>
                      </select>
                    </div>
                    <Input label="Initial Deposit (₹)" name="deposit" type="number" placeholder="Min. ₹500" onChange={handleInputChange} value={formData.deposit || ''} required />
                    
                    <Input label="Mobile Number" name="mobile" placeholder="10-digit number" onChange={handleInputChange} value={formData.mobile || ''} required />
                    <Input label="Email Address" name="email" type="email" placeholder="example@bank.com" onChange={handleInputChange} value={formData.email || ''} required />
                    
                    {/* Conditional Fields */}
                    {formData.accountType === 'current' && (
                      <Input label="GST Number" name="gst" placeholder="15-digit GSTIN" onChange={handleInputChange} value={formData.gst || ''} required />
                    )}
                    {formData.accountType === 'joint' && (
                      <Input label="Secondary Holder Name" name="secondaryHolder" placeholder="Full name of joint holder" onChange={handleInputChange} value={formData.secondaryHolder || ''} required />
                    )}
                    {formData.accountType === 'fd' && (
                      <div className="space-y-2">
                        <label className="label">Tenure (Years)</label>
                        <select name="tenure" onChange={handleInputChange} value={formData.tenure || ''} className="input" required>
                          <option value="1">1 Year</option>
                          <option value="3">3 Years</option>
                          <option value="5">5 Years</option>
                          <option value="10">10 Years</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end pt-6">
                    <Button type="button" onClick={() => setFormStep(2)} className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs">
                      Next Step <ArrowRight size={18} className="ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: Personal & Identity */}
              {formStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Conditional: Only for Current Accounts */}
                    {formData.accountType === 'current' && (
                      <>
                        <Input label="Occupation" name="occupation" placeholder="e.g. Software Engineer" onChange={handleInputChange} value={formData.occupation || ''} required />
                        <div className="space-y-2">
                          <label className="label">Annual Income (₹)</label>
                          <select name="annualIncome" onChange={handleInputChange} value={formData.annualIncome || ''} className="input" required>
                            <option value="">Select range</option>
                            <option value="0-5L">0 - 5 Lakhs</option>
                            <option value="5-10L">5 - 10 Lakhs</option>
                            <option value="10-25L">10 - 25 Lakhs</option>
                            <option value="25L+">Above 25 Lakhs</option>
                          </select>
                        </div>
                      </>
                    )}
                    
                    <Input label="Aadhaar Number" name="aadhar" placeholder="12-digit number" onChange={handleInputChange} value={formData.aadhar || ''} required />
                    <Input label="PAN Card Number" name="pan" placeholder="ABCDE1234F" onChange={handleInputChange} value={formData.pan || ''} required />
                  </div>
                  <div className="flex justify-between pt-6">
                    <Button type="button" variant="secondary" onClick={() => setFormStep(1)} className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs border-slate-200">
                      Back
                    </Button>
                    <Button type="button" onClick={() => setFormStep(3)} className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs">
                      Next Step <ArrowRight size={18} className="ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: Nominee & Finalize */}
              {formStep === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Nominee Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="Nominee Name" name="nomineeName" placeholder="Enter name" onChange={handleInputChange} value={formData.nomineeName || ''} required />
                      <div className="space-y-2">
                        <label className="label">Relationship</label>
                        <select name="nomineeRelation" onChange={handleInputChange} value={formData.nomineeRelation || ''} className="input" required>
                          <option value="">Select relationship</option>
                          <option value="father">Father</option>
                          <option value="mother">Mother</option>
                          <option value="spouse">Spouse</option>
                          <option value="child">Child</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-blue-900 leading-tight">Digital KYC Verification</p>
                      <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">Ready for Clerk & Manager Review</p>
                    </div>
                  </div>

                  <div className="flex justify-between pt-6">
                    <Button type="button" variant="secondary" onClick={() => setFormStep(2)} className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs border-slate-200">
                      Back
                    </Button>
                    <button 
                      type="submit" 
                      disabled={submitting} 
                      className="h-14 px-10 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest"
                    >
                      {submitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>Final Submit <FileCheck size={18} /></>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Fallback for other request types (Transfer, Bills, etc) */
            <>
              {/* USE CASE: Fund transfer */}
              {modal.type === 'transfer' && (
                <div className="space-y-6">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="label">Transfer Type</label>
                        <select 
                          name="transferType" 
                          onChange={handleInputChange} 
                          value={formData.transferType || 'debit'}
                          className="input" 
                          required
                        >
                          <option value="debit">Debit Transfer (To Others)</option>
                          <option value="credit">Credit Transfer (Self - To Own Account)</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="label">From Account</label>
                        <select 
                          name="fromAccount" 
                          onChange={handleInputChange} 
                          value={formData.fromAccount || ''}
                          className="input" 
                          required
                        >
                          <option value="">Select source account</option>
                          {allAccounts.map(acc => (
                            <option key={acc.id} value={acc.accountNumber}>
                              {acc.accountType.toUpperCase()} - {acc.accountNumber} (₹{acc.balance})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {formData.transferType === 'credit' ? (
                        <div className="space-y-2">
                          <label className="label">To Own Account</label>
                          <select 
                            name="recipient" 
                            onChange={handleInputChange} 
                            value={formData.recipient || ''}
                            className="input" 
                            required
                          >
                            <option value="">Select destination account</option>
                            {allAccounts
                              .filter(acc => acc.accountNumber !== formData.fromAccount)
                              .map(acc => (
                                <option key={acc.id} value={acc.accountNumber}>
                                  {acc.accountType.toUpperCase()} - {acc.accountNumber}
                                </option>
                              ))
                            }
                          </select>
                        </div>
                      ) : (
                        <>
                          <Input 
                            label="Recipient Name" 
                            name="recipientName" 
                            placeholder="e.g. Dhruvi" 
                            onChange={handleInputChange} 
                            value={formData.recipientName || ''}
                            required 
                          />
                          <Input 
                            label="Recipient Account Number" 
                            name="recipient" 
                            placeholder="Enter destination account number" 
                            onChange={handleInputChange} 
                            value={formData.recipient || ''}
                            required 
                          />
                        </>
                      )}
                      
                      <Input 
                        label="Amount (₹)" 
                        name="amount" 
                        type="number" 
                        placeholder="0.00" 
                        onChange={handleInputChange} 
                        value={formData.amount || ''}
                        required 
                      />

                      {formData.transferType === 'debit' && (
                        <Input 
                          label="Note / Purpose" 
                          name="note" 
                          placeholder="e.g. Bill payment, Rent, etc." 
                          onChange={handleInputChange} 
                          value={formData.note || ''}
                        />
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white">
                      <ShieldCheck size={20} />
                    </div>
                    <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest">
                      {formData.transferType === 'credit' 
                        ? 'Internal transfer between your verified accounts.' 
                        : 'External transfer requires standard bank verification.'}
                    </p>
                  </div>

                  <div className="pt-6">
                    <button 
                      type="submit" 
                      disabled={submitting} 
                      className={`w-full h-16 rounded-[24px] shadow-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 text-lg font-black uppercase tracking-widest ${
                        transferSuccess ? 'bg-emerald-600 shadow-emerald-100' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
                      }`}
                    >
                      {submitting ? (
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          Processing...
                        </div>
                      ) : transferSuccess ? (
                        <div className="flex items-center gap-3 animate-in zoom-in duration-300">
                          <CheckCircle2 className="w-7 h-7" />
                          Transfer Complete
                        </div>
                      ) : (
                        <>Transfer Now <ArrowRight size={22} /></>
                      )}
                    </button>
                    <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6">Securely processed by SmartBank Core Engine</p>
                  </div>
                </div>
              )}
              
              {/* USE CASE: Pay bills / Recharge */}
              {modal.type === 'bill-pay' && (
                <div className="space-y-6">
                  {/* Common: From Account & Category Selection */}
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="label">From Account</label>
                        <select 
                          name="fromAccount" 
                          onChange={handleInputChange} 
                          value={formData.fromAccount || ''}
                          className="input" 
                          required
                        >
                          <option value="">Select source account</option>
                          {allAccounts.map(acc => (
                            <option key={acc.id} value={acc.accountNumber}>
                              {acc.accountType.toUpperCase()} - {acc.accountNumber} (₹{acc.balance})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="label">Category</label>
                        <select name="billCategory" onChange={handleInputChange} value={formData.billCategory || ''} className="input" required>
                          <option value="">Select category</option>
                          <option value="electricity">Electricity Bill</option>
                          <option value="credit-card">Credit Card Bill Payment</option>
                          <option value="loan-emi">Loan EMI Payment</option>
                          <option value="mobile-recharge">Mobile Recharge</option>
                        </select>
                      </div>
                    </div>

                    {/* Default Form for other categories */}
                    {formData.billCategory && !['electricity', 'mobile-recharge', 'credit-card', 'loan-emi'].includes(formData.billCategory) && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Input label="Reference Number" name="refNum" placeholder="Consumer ID / Card Num / Mobile" onChange={handleInputChange} required />
                          <Input label="Amount (₹)" name="amount" type="number" placeholder="0.00" onChange={handleInputChange} required />
                        </div>
                        <div className="pt-4">
                          <button 
                            type="submit" 
                            disabled={submitting}
                            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 uppercase tracking-widest text-xs"
                          >
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Submit Payment <ArrowRight size={18} /></>}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SPECIAL FLOW: Loan EMI Payment */}
                  {formData.billCategory === 'loan-emi' && (() => {
                    const showLoanDetails = formData.refNum === MOCK_LOAN_DETAILS.loanId;
                    const emiAmount = MOCK_LOAN_DETAILS.emiAmount;
                    const penalty = MOCK_LOAN_DETAILS.lateFee;
                    const totalPayable = emiAmount + penalty;
                    const isAmountBelowEmi = showLoanDetails && parseFloat(formData.amount || 0) < emiAmount;
                    
                    const sourceAccount = allAccounts.find(acc => acc.accountNumber === formData.fromAccount);
                    const isBalanceInsufficient = sourceAccount && sourceAccount.balance < parseFloat(formData.amount || 0);

                    return (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        {loanStep === 1 && (
                          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <Input 
                                label="Loan Account Number / ID" 
                                name="refNum" 
                                placeholder="Enter Loan ID (Try: AD14235346457567)" 
                                onChange={handleInputChange} 
                                value={formData.refNum || ''} 
                                required 
                              />
                              {showLoanDetails && (
                                <div className="animate-in fade-in slide-in-from-left-4">
                                  <Input 
                                    label="Account Holder Name" 
                                    name="cardHolder" 
                                    placeholder="Fetching..." 
                                    value={formData.cardHolder || ''} 
                                    readOnly
                                    required 
                                  />
                                </div>
                              )}
                            </div>

                            {showLoanDetails && (
                              <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
                                {/* Loan Overview Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Loan</p>
                                    <p className="text-xs font-black text-slate-900">₹{MOCK_LOAN_DETAILS.totalLoanAmount.toLocaleString()}</p>
                                  </div>
                                  <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Interest</p>
                                    <p className="text-xs font-black text-slate-900">₹{MOCK_LOAN_DETAILS.interestAmount.toLocaleString()}</p>
                                  </div>
                                  <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Remaining</p>
                                    <p className="text-xs font-black text-blue-600">₹{MOCK_LOAN_DETAILS.remainingBalance.toLocaleString()}</p>
                                  </div>
                                  <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 shadow-sm text-center">
                                    <p className="text-[8px] font-black text-rose-400 uppercase tracking-widest mb-1">Late Fee</p>
                                    <p className="text-xs font-black text-rose-600">₹{penalty.toLocaleString()}</p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">EMI Amount</p>
                                    <p className="text-sm font-black text-slate-900">₹{emiAmount.toLocaleString()}</p>
                                  </div>
                                  <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Due Date</p>
                                    <p className="text-sm font-black text-rose-500">{MOCK_LOAN_DETAILS.dueDate}</p>
                                  </div>
                                </div>

                                <div className="p-6 bg-blue-600 rounded-[32px] border border-blue-500 shadow-xl shadow-blue-100 flex items-center justify-between text-white">
                                  <div>
                                    <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-1">Total Payable (EMI + Penalty)</p>
                                    <p className="text-3xl font-black">₹{totalPayable.toLocaleString()}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-1">Status</p>
                                    <span className="px-3 py-1 bg-rose-500 text-white text-[10px] font-black rounded-full uppercase tracking-tighter shadow-sm">Overdue</span>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <label className="label">Amount to Pay (₹)</label>
                                  <div className="relative">
                                    <input 
                                      type="number" 
                                      name="amount" 
                                      className={`input ${isAmountBelowEmi ? 'border-rose-500 focus:border-rose-600 bg-rose-50' : ''}`} 
                                      placeholder="Enter amount to pay" 
                                      onChange={handleInputChange} 
                                      value={formData.amount || ''} 
                                      required 
                                    />
                                    {isAmountBelowEmi && (
                                      <p className="absolute -bottom-5 left-0 text-[9px] font-black text-rose-500 uppercase tracking-widest animate-in slide-in-from-top-1">
                                        Min ₹{emiAmount.toLocaleString()} required for EMI
                                      </p>
                                    )}
                                    {!isAmountBelowEmi && parseFloat(formData.amount || 0) > totalPayable && (
                                      <p className="absolute -bottom-5 left-0 text-[9px] font-black text-blue-500 uppercase tracking-widest animate-in slide-in-from-top-1">
                                        Prepayment applied (closing loan faster)
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex gap-4 pt-4">
                              <button 
                                type="button" 
                                onClick={closeModal}
                                className="w-1/3 h-14 bg-slate-200 text-slate-600 font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-slate-300 transition-colors"
                              >
                                Cancel
                              </button>
                              <button 
                                type="button" 
                                onClick={() => {
                                  if (!formData.fromAccount) {
                                    setFormError('Please select a source account to pay from.');
                                    return;
                                  }
                                  if (isAmountBelowEmi) {
                                    setFormError(`EMI payment must be at least ₹${emiAmount.toLocaleString()}.`);
                                    return;
                                  }
                                  if (isBalanceInsufficient) {
                                    setFormError(`Insufficient balance in account ${formData.fromAccount}. Available: ₹${(sourceAccount?.balance || 0).toLocaleString()}`);
                                    return;
                                  }
                                  if (!formData.refNum || !formData.cardHolder || !formData.amount) {
                                    setFormError('Please fill in all required fields.');
                                    return;
                                  }
                                  
                                  setFormError('');
                                  setSubmitting(true);
                                  // Simulate EMI payment processing
                                  setTimeout(() => {
                                    setSubmitting(false);
                                    setLoanStatus('success');
                                    setLoanStep(2);
                                  }, 2000);
                                }}
                                disabled={submitting || !showLoanDetails || isAmountBelowEmi}
                                className="w-2/3 h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-xs disabled:opacity-50"
                              >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Pay EMI <ArrowRight size={18} /></>}
                              </button>
                            </div>
                          </div>
                        )}

                        {loanStep === 2 && (
                          <div className="p-10 bg-white rounded-[40px] border border-slate-100 shadow-2xl space-y-10 animate-in zoom-in-95 text-center">
                            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-2 animate-in bounce-in duration-700">
                              <CheckCircle2 size={56} />
                            </div>
                            <div className="space-y-3">
                              <h4 className="text-3xl font-black text-slate-900 tracking-tight">EMI Paid!</h4>
                              <p className="text-slate-500 font-medium text-lg">Your Loan EMI payment of ₹{parseFloat(formData.amount).toLocaleString()} was successful.</p>
                            </div>
                            <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 text-left space-y-4">
                              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Loan ID</span>
                                <span className="font-bold text-slate-900">{formData.refNum}</span>
                              </div>
                              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Account</span>
                                <span className="font-mono font-bold text-slate-900">{formData.fromAccount}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Receipt ID</span>
                                <span className="font-mono font-bold text-slate-900">EMI{Math.floor(Math.random() * 90000000 + 10000000)}</span>
                              </div>
                            </div>
                            <button 
                              type="button" 
                              onClick={closeModal}
                              className="w-full h-16 bg-slate-900 text-white font-black rounded-2xl shadow-xl transition-all uppercase tracking-widest text-sm"
                            >
                              Done
                            </button>
                          </div>
                        )}
                      </div>
                    );})()}

                  {/* SPECIAL FLOW: Credit Card Bill Payment */}
                  {formData.billCategory === 'credit-card' && (() => {
                    const showCcAmountFields = formData.refNum?.length === 16 && formData.cardHolder && formData.bankName;
                    const isCustomAmount = formData.ccAmountOption === 'custom';
                    const isAmountBelowMin = isCustomAmount && parseFloat(formData.amount || 0) < MOCK_CC_DETAILS.minDue;
                    
                    return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                      {/* Step 1: CC Details Form */}
                      {ccStep === 1 && (
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input 
                              label="Credit Card Number" 
                              name="refNum" 
                              maxLength="16"
                              placeholder="XXXX XXXX XXXX XXXX" 
                              onChange={handleInputChange} 
                              value={formData.refNum || ''} 
                              required 
                            />
                            <Input 
                              label="Card Holder Name" 
                              name="cardHolder" 
                              placeholder="As on card" 
                              onChange={handleInputChange} 
                              value={formData.cardHolder || ''} 
                              required 
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="label">Bank Name</label>
                              <select 
                                name="bankName" 
                                onChange={handleInputChange} 
                                value={formData.bankName || ''} 
                                className="input" 
                                required
                              >
                                <option value="">Select Bank</option>
                                {CC_BANKS.map(bank => (
                                  <option key={bank} value={bank}>{bank}</option>
                                ))}
                              </select>
                            </div>
                            {showCcAmountFields && (
                              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <label className="label">Amount to Pay (₹)</label>
                                <div className="relative">
                                  <input 
                                    type="number" 
                                    name="amount" 
                                    className={`input ${isAmountBelowMin ? 'border-rose-500 focus:border-rose-600 bg-rose-50' : ''}`} 
                                    placeholder="0.00" 
                                    onChange={handleInputChange} 
                                    value={formData.amount || ''} 
                                    required 
                                    readOnly={!isCustomAmount}
                                  />
                                  {isAmountBelowMin && (
                                    <p className="absolute -bottom-5 left-0 text-[9px] font-black text-rose-500 uppercase tracking-widest animate-in slide-in-from-top-1">
                                      Min ₹{MOCK_CC_DETAILS.minDue.toLocaleString()} required
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {showCcAmountFields && (
                            <>
                              {/* Extra Features: Outstanding & Due Date */}
                              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Outstanding</p>
                                  <p className="text-sm font-black text-slate-900">₹{MOCK_CC_DETAILS.outstanding.toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Due Date</p>
                                  <p className="text-sm font-black text-rose-500">{MOCK_CC_DETAILS.dueDate}</p>
                                </div>
                              </div>

                              {/* Amount Options (Radio Buttons) */}
                              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Payment Option</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  {[
                                    { id: 'total', label: 'Total Amount', value: MOCK_CC_DETAILS.totalAmount },
                                    { id: 'min', label: 'Minimum Due', value: MOCK_CC_DETAILS.minDue },
                                    { id: 'custom', label: 'Custom Amount', value: '' }
                                  ].map((option) => (
                                    <label 
                                      key={option.id}
                                      className={`flex items-center justify-between p-4 bg-white border-2 rounded-2xl cursor-pointer transition-all ${
                                        formData.ccAmountOption === option.id 
                                          ? 'border-blue-600 ring-4 ring-blue-50 shadow-md' 
                                          : 'border-slate-100 hover:border-blue-100'
                                      }`}
                                    >
                                      <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{option.label}</span>
                                        {option.value && <span className="text-xs font-bold text-blue-600">₹{option.value.toLocaleString()}</span>}
                                      </div>
                                      <input 
                                        type="radio" 
                                        name="ccAmountOption" 
                                        value={option.id} 
                                        checked={formData.ccAmountOption === option.id}
                                        onChange={handleInputChange}
                                        className="hidden"
                                      />
                                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                        formData.ccAmountOption === option.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200'
                                      }`}>
                                        {formData.ccAmountOption === option.id && <Check size={10} strokeWidth={4} />}
                                      </div>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}

                          <div className="flex gap-4 pt-4">
                            <button 
                              type="button" 
                              onClick={closeModal}
                              className="w-1/3 h-14 bg-slate-200 text-slate-600 font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-slate-300 transition-colors"
                            >
                              Cancel
                            </button>
                            <button 
                              type="button" 
                              onClick={() => {
                                if (!formData.fromAccount) {
                                  setFormError('Please select a source account to pay from.');
                                  return;
                                }
                                const sourceAccount = allAccounts.find(acc => acc.accountNumber === formData.fromAccount);
                                if (!sourceAccount || sourceAccount.balance < parseFloat(formData.amount || 0)) {
                                  setFormError(`Insufficient balance in account ${formData.fromAccount}. Available: ₹${(sourceAccount?.balance || 0).toLocaleString()}`);
                                  return;
                                }
                                if (formData.refNum?.length !== 16) {
                                  setFormError('Credit card number must be 16 digits.');
                                  return;
                                }
                                if (!formData.cardHolder || !formData.bankName || !formData.amount) {
                                  setFormError('Please fill in all required fields.');
                                  return;
                                }
                                if (isAmountBelowMin) {
                                  setFormError(`Custom payment must be at least ₹${MOCK_CC_DETAILS.minDue.toLocaleString()}.`);
                                  return;
                                }
                                setFormError('');
                                setSubmitting(true);
                                // Simulate direct payment processing
                                setTimeout(() => {
                                  setSubmitting(false);
                                  setCcPaymentStatus('success');
                                  setCcStep(2);
                                }, 2000);
                              }}
                              disabled={submitting || !showCcAmountFields || isAmountBelowMin || !formData.fromAccount}
                              className="w-2/3 h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-xs disabled:opacity-50"
                            >
                              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Pay Now <ArrowRight size={18} /></>}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Step 2: Success / Failure Result */}
                      {ccStep === 2 && (
                        <div className="p-10 bg-white rounded-[40px] border border-slate-100 shadow-2xl space-y-10 animate-in zoom-in-95 text-center">
                          {ccPaymentStatus === 'success' ? (
                            <>
                              <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-2 animate-in bounce-in duration-700">
                                <CheckCircle2 size={56} />
                              </div>
                              <div className="space-y-3">
                                <h4 className="text-3xl font-black text-slate-900 tracking-tight">Payment Successful!</h4>
                                <p className="text-slate-500 font-medium text-lg">Your credit card bill payment of ₹{parseFloat(formData.amount).toLocaleString()} was processed successfully.</p>
                              </div>
                              <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 text-left space-y-4">
                                <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Bank</span>
                                  <span className="font-bold text-slate-900">{formData.bankName}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Card</span>
                                  <span className="font-mono font-bold text-slate-900">XXXX-XXXX-XXXX-{formData.refNum?.slice(-4)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Ref ID</span>
                                  <span className="font-mono font-bold text-slate-900">TXN{Math.floor(Math.random() * 90000000 + 10000000)}</span>
                                </div>
                              </div>
                              <button 
                                type="button" 
                                onClick={closeModal}
                                className="w-full h-16 bg-slate-900 text-white font-black rounded-2xl shadow-xl transition-all uppercase tracking-widest text-sm"
                              >
                                Done
                              </button>
                            </>
                          ) : (
                            <>
                              <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500 mb-2">
                                <X size={56} />
                              </div>
                              <div className="space-y-3">
                                <h4 className="text-3xl font-black text-rose-600 tracking-tight">Payment Failed</h4>
                                <p className="text-slate-500 font-medium text-lg">We couldn't process your payment at this moment.</p>
                              </div>
                              <div className="p-6 bg-rose-50 rounded-[32px] border border-rose-100">
                                <p className="text-sm font-bold text-rose-700 italic">"Transaction declined by bank. Please try again later."</p>
                              </div>
                              <div className="flex flex-col gap-3">
                                <button 
                                  type="button" 
                                  onClick={() => setCcStep(1)}
                                  className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl transition-all uppercase tracking-widest text-sm"
                                >
                                  Try Again
                                </button>
                                <button 
                                  type="button" 
                                  onClick={closeModal}
                                  className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                                >
                                  Close
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );})()}

                  {/* SPECIAL FLOW: Electricity Bill */}
                  {formData.billCategory === 'electricity' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                      {/* Step 1: Selection & Details */}
                      {billStep === 1 ? (
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="label">Select State</label>
                              <select name="state" onChange={handleInputChange} value={formData.state || ''} className="input" required>
                                <option value="">Select State</option>
                                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="label">Electricity Board</label>
                              <select name="board" onChange={handleInputChange} value={formData.board || ''} className="input" required disabled={!formData.state}>
                                <option value="">Select Board</option>
                                {(ELECTRICITY_BOARDS[formData.state] || ["Generic Power Distribution"]).map(b => (
                                  <option key={b} value={b}>{b}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Service Number" name="serviceNum" placeholder="Enter Service/Consumer Number" onChange={handleInputChange} value={formData.serviceNum || ''} required />
                            <div className="space-y-2">
                              <label className="label">Select City</label>
                              <select name="city" onChange={handleInputChange} value={formData.city || ''} className="input" required disabled={!formData.board}>
                                <option value="">Select City</option>
                                {(BOARD_CITIES[formData.board] || ["Main City", "Other City"]).map(c => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <Input label="Nickname (Optional)" name="nickname" placeholder="e.g. Home, Office" onChange={handleInputChange} value={formData.nickname || ''} />

                          <div className="pt-4">
                            <button 
                              type="button" 
                              onClick={handleCheckBill}
                              disabled={checkingBill || !formData.state || !formData.board || !formData.serviceNum || !formData.city}
                              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 uppercase tracking-widest text-xs"
                            >
                              {checkingBill ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Proceed <ArrowRight size={18} /></>}
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Step 2: Bill Result */
                        <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-xl space-y-8 animate-in zoom-in-95 duration-300 text-center">
                          {billFound ? (
                            <>
                              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600 mb-4">
                                <Receipt size={40} />
                              </div>
                              <div className="space-y-2">
                                <h4 className="text-2xl font-black text-slate-900 tracking-tight">Bill Due Found!</h4>
                                <p className="text-slate-500 font-medium">Electricity Bill for {formData.board}</p>
                              </div>
                              <div className="p-6 bg-slate-900 rounded-[32px] text-white">
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-2">Amount Due</p>
                                <p className="text-4xl font-black tracking-tight">₹{billAmount.toLocaleString()}</p>
                              </div>
                              <div className="flex flex-col gap-3">
                                <button 
                                  type="submit" 
                                  disabled={submitting}
                                  className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 uppercase tracking-widest text-sm"
                                >
                                  {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Pay Now <ArrowRight size={20} /></>}
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => setBillStep(1)}
                                  className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                                >
                                  Cancel & Back
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-4">
                                <CheckCircle2 size={40} />
                              </div>
                              <div className="space-y-2">
                                <h4 className="text-2xl font-black text-slate-900 tracking-tight">No bill due</h4>
                                <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs">No amount due on your bill</p>
                                <p className="text-slate-500 font-medium mt-4">Everything is up to date for service number {formData.serviceNum}.</p>
                              </div>
                              <div className="pt-6">
                                <button 
                                  type="button" 
                                  onClick={closeModal}
                                  className="w-full h-14 bg-slate-900 text-white font-black rounded-2xl shadow-xl transition-all uppercase tracking-widest text-xs"
                                >
                                  Close
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SPECIAL FLOW: Mobile Recharge */}
                  {formData.billCategory === 'mobile-recharge' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                      {/* Step 1: Mobile Number & Contacts */}
                      {rechargeStep === 1 && (
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
                          <div className="space-y-2">
                            <label className="label">Enter Mobile Number</label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">+91</span>
                              <input 
                                type="text" 
                                name="refNum"
                                maxLength="10"
                                placeholder="98765 43210"
                                value={formData.refNum || ''}
                                onChange={handleInputChange}
                                className="input pl-14"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Contacts</h5>
                              <div className="relative w-32 xl:w-48">
                                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                  type="text" 
                                  placeholder="Search..." 
                                  value={rechargeSearch}
                                  onChange={(e) => setRechargeSearch(e.target.value)}
                                  className="w-full h-8 pl-8 pr-3 bg-white border border-slate-100 rounded-full text-[10px] focus:outline-none focus:border-blue-200"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                              {MOCK_CONTACTS
                                .filter(c => c.name.toLowerCase().includes(rechargeSearch.toLowerCase()) || c.number.includes(rechargeSearch))
                                .map(contact => (
                                  <button
                                    key={contact.number}
                                    type="button"
                                    onClick={() => {
                                      setFormData(prev => ({ ...prev, refNum: contact.number }));
                                      setRechargeStep(2);
                                    }}
                                    className="flex items-center justify-between p-3 bg-white hover:bg-blue-50 border border-slate-100 rounded-2xl transition-all group text-left"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-black text-xs uppercase">
                                        {contact.name.charAt(0)}
                                      </div>
                                      <div>
                                        <p className="text-xs font-black text-slate-900">{contact.name}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">{contact.number}</p>
                                      </div>
                                    </div>
                                    <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
                                  </button>
                                ))
                              }
                            </div>
                          </div>

                          <div className="pt-4">
                            <button 
                              type="button" 
                              onClick={() => setRechargeStep(2)}
                              disabled={!formData.refNum || formData.refNum.length !== 10}
                              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 uppercase tracking-widest text-xs"
                            >
                              Next Step <ArrowRight size={18} />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Step 2: Prepaid/Postpaid & Provider */}
                      {rechargeStep === 2 && (
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-8 animate-in slide-in-from-right-4">
                          <div className="space-y-4 text-center">
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Select Recharge Type</p>
                            <div className="flex p-1.5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                              <button 
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, rechargeType: 'prepaid' }))}
                                className={`flex-1 h-12 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                                  formData.rechargeType === 'prepaid' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:text-slate-600'
                                }`}
                              >
                                Prepaid
                              </button>
                              <button 
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, rechargeType: 'postpaid' }))}
                                className={`flex-1 h-12 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                                  formData.rechargeType === 'postpaid' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:text-slate-600'
                                }`}
                              >
                                Postpaid
                              </button>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest text-center">Select Provider</p>
                            <div className="grid grid-cols-3 gap-4">
                              {MOBILE_PROVIDERS.map(provider => (
                                <button
                                  key={provider.name}
                                  type="button"
                                  onClick={() => setFormData(prev => ({ ...prev, provider: provider.name }))}
                                  className={`group relative flex flex-col items-center justify-center gap-3 p-5 bg-white rounded-3xl border-2 transition-all active:scale-95 ${
                                    formData.provider === provider.name 
                                      ? 'border-blue-600 shadow-xl shadow-blue-50 ring-4 ring-blue-50' 
                                      : 'border-slate-100 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-100'
                                  }`}
                                >
                                  {formData.provider === provider.name && (
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg animate-in zoom-in duration-300">
                                      <Check size={14} strokeWidth={3} />
                                    </div>
                                  )}
                                  <div 
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-inner transition-transform group-hover:scale-110"
                                    style={{ backgroundColor: provider.color }}
                                  >
                                    {provider.name.charAt(0)}
                                  </div>
                                  <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                                    formData.provider === provider.name ? 'text-blue-600' : 'text-slate-500'
                                  }`}>
                                    {provider.name}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-4 pt-4">
                            <button 
                              type="button" 
                              onClick={() => setRechargeStep(1)}
                              className="w-1/3 h-14 bg-slate-200 text-slate-600 font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-slate-300 transition-colors"
                            >
                              Back
                            </button>
                            <button 
                              type="button" 
                              onClick={() => {
                                setRechargeStep(3);
                                setRechargeSearch('');
                              }}
                              disabled={!formData.rechargeType || !formData.provider}
                              className="w-2/3 h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-100 flex items-center justify-center gap-3 transition-all disabled:opacity-50 uppercase tracking-widest text-xs active:scale-95"
                            >
                              Select Plan <ArrowRight size={18} />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Step 3: Plan Selection */}
                      {rechargeStep === 3 && (
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-6 animate-in slide-in-from-right-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Available Plans for {formData.provider}</h5>
                              <div className="relative w-48">
                                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                  type="text" 
                                  placeholder="Search plan by price, data..." 
                                  value={rechargeSearch}
                                  onChange={(e) => setRechargeSearch(e.target.value)}
                                  className="w-full h-10 pl-10 pr-4 bg-white border border-slate-100 rounded-2xl text-[10px] focus:outline-none focus:border-blue-200"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                              {(RECHARGE_PLANS[formData.provider] || [])
                                .filter(p => p.price.toString().includes(rechargeSearch) || p.data.toLowerCase().includes(rechargeSearch.toLowerCase()) || p.type.toLowerCase().includes(rechargeSearch.toLowerCase()))
                                .map(plan => (
                                  <button
                                    key={plan.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedPlan(plan);
                                      setFormData(prev => ({ ...prev, amount: plan.price, planId: plan.id }));
                                    }}
                                    className={`flex items-center justify-between p-4 bg-white rounded-2xl border-2 transition-all text-left ${
                                      selectedPlan?.id === plan.id ? 'border-blue-600 shadow-md ring-4 ring-blue-50' : 'border-slate-100 hover:border-blue-100'
                                    }`}
                                  >
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xl font-black text-slate-900">₹{plan.price}</span>
                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black rounded-full uppercase tracking-tighter">{plan.type}</span>
                                      </div>
                                      <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1 text-slate-500">
                                          <Database size={10} />
                                          <span className="text-[10px] font-bold">{plan.data}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-slate-500">
                                          <Clock size={10} />
                                          <span className="text-[10px] font-bold">{plan.validity}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                      selectedPlan?.id === plan.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200'
                                    }`}>
                                      {selectedPlan?.id === plan.id && <Check size={12} />}
                                    </div>
                                  </button>
                                ))
                              }
                            </div>
                          </div>

                          <div className="flex gap-4 pt-4">
                            <button 
                              type="button" 
                              onClick={() => setRechargeStep(2)}
                              className="w-1/3 h-14 bg-slate-200 text-slate-600 font-black rounded-2xl uppercase tracking-widest text-xs"
                            >
                              Back
                            </button>
                            <button 
                              type="button" 
                              onClick={() => setRechargeStep(4)}
                              disabled={!selectedPlan}
                              className="w-2/3 h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 uppercase tracking-widest text-xs"
                            >
                              Confirm Plan <ArrowRight size={18} />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Step 4: Final Confirmation */}
                      {rechargeStep === 4 && selectedPlan && (
                        <div className="p-8 bg-white rounded-[40px] border border-slate-100 shadow-2xl space-y-8 animate-in zoom-in-95 text-center">
                          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600 mb-2">
                            <Smartphone size={40} />
                          </div>
                          
                          <div className="space-y-1">
                            <h4 className="text-2xl font-black text-slate-900">Confirm Recharge</h4>
                            <p className="text-slate-500 text-sm font-medium">For +91 {formData.refNum}</p>
                          </div>

                          <div className="p-6 bg-slate-900 rounded-[32px] text-white text-left space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                              <div>
                                <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">Operator</p>
                                <p className="text-sm font-black">{formData.provider} - {formData.rechargeType.toUpperCase()}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">Amount</p>
                                <p className="text-xl font-black">₹{selectedPlan.price}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">Data</p>
                                <p className="text-xs font-bold">{selectedPlan.data}</p>
                              </div>
                              <div>
                                <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">Validity</p>
                                <p className="text-xs font-bold">{selectedPlan.validity}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-3">
                            <button 
                              type="submit" 
                              disabled={submitting}
                              className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 uppercase tracking-widest text-sm"
                            >
                              {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Proceed to Pay <ArrowRight size={20} /></>}
                            </button>
                            <button 
                              type="button" 
                              onClick={() => setRechargeStep(3)}
                              className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                            >
                              Change Plan
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* USE CASE: Request services */}
              {modal.type === 'request-services' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="label">Service Type</label>
                    <select name="serviceType" onChange={handleInputChange} className="input" required>
                      <option value="">Choose service</option>
                      <option value="credit-card">Request Credit Card</option>
                      <option value="debit-card">Request Debit Card</option>
                      <option value="loan">Personal Loan Request</option>
                      <option value="kyc">KYC Document Update</option>
                    </select>
                  </div>
                  <Input label="Additional Details" name="details" placeholder="Explain your request..." onChange={handleInputChange} />
                  
                  <div className="pt-6">
                    <button 
                      type="submit" 
                      disabled={submitting} 
                      className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-[24px] shadow-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 text-lg font-black uppercase tracking-widest shadow-blue-100"
                    >
                      {submitting ? (
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        <>Submit {modal.title} Request <ArrowRight size={22} /></>
                      )}
                    </button>
                    <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6">Securely processed by SmartBank Core Engine</p>
                  </div>
                </div>
              )}
            </>
          )}
        </form>
      </Modal>

      {/* Account Details Modal */}
      <Modal
        isOpen={!!selectedAccount}
        onClose={() => setSelectedAccount(null)}
        title="Account Detailed Specification"
        size="lg"
      >
        {selectedAccount && (
          <div className="space-y-8">
            {/* Header: Name & Type */}
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[32px] border border-slate-100">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-200">
                  {selectedAccount.userName?.[0] || userProfile?.firstName?.[0]}
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Holder</p>
                  <h3 className="text-xl font-black text-slate-900">{selectedAccount.userName || `${userProfile?.firstName} ${userProfile?.lastName}`}</h3>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Type</p>
                <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                  {selectedAccount.accountType || 'Saving'}
                </span>
              </div>
            </div>

            {/* Core Stats: Number & Balance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-slate-900 rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 bg-blue-600/20 rounded-full blur-2xl -mr-5 -mt-5 group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-4">Account Number</p>
                  <p className="text-2xl font-mono tracking-[0.2em] font-bold">
                    {selectedAccount.accountNumber || `SB-${selectedAccount.id.substring(0, 4).toUpperCase()}-XXXX-XXXX`}
                  </p>
                </div>
              </div>
              <div className="p-8 bg-white border border-slate-100 rounded-[32px] shadow-xl flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Available Balance</p>
                  <h4 className="text-4xl font-black text-slate-900 tracking-tight">₹{parseFloat(selectedAccount.balance || 0).toLocaleString()}</h4>
                </div>
                <div className="mt-4 flex items-center gap-2 text-emerald-500 font-bold text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Real-time Verified
                </div>
              </div>
            </div>

            {/* Nominee Details */}
            <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Nominee Information</h4>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nominee Name</p>
                  <p className="font-bold text-slate-700">{selectedAccount.details?.nomineeName || 'Not Specified'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Relationship</p>
                  <p className="font-bold text-slate-700">{selectedAccount.details?.nomineeRelation || 'Not Specified'}</p>
                </div>
              </div>
            </div>

            {/* Actions: View Debit Card */}
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  setSelectedAccount(null);
                  setActiveTab('cards');
                }}
                className="flex-1 h-16 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-xl flex items-center justify-center gap-3"
              >
                <CardIcon size={20} /> View Debit Card
              </button>
            </div>

            {/* Account Specific Transaction History */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recent Transactions</h4>
                <button 
                  onClick={() => {
                    setSelectedAccount(null);
                    setActiveTab('history');
                  }}
                  className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                >
                  View Full History
                </button>
              </div>
              <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden">
                <table className="w-full">
                  <tbody className="divide-y divide-slate-50">
                    {transactionHistory
                      .filter(tx => 
                        (tx.fromAccountNum === selectedAccount.accountNumber) || 
                        (tx.toAccountNum === selectedAccount.accountNumber)
                      )
                      .slice(0, 3)
                      .map((tx, idx) => (
                        <tr key={tx.id || idx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-4">
                              <span className="text-xl">{tx.icon}</span>
                              <div>
                                <p className="text-sm font-bold text-slate-900">{tx.name}</p>
                                <div className="flex flex-col gap-0.5 mt-1">
                                  <p className="text-[10px] text-slate-400 uppercase font-medium">{tx.date}</p>
                                  {tx.category === 'transfer' && (
                                    <p className="text-[9px] text-slate-500 font-bold">
                                      {tx.fromAccountNum === selectedAccount.accountNumber 
                                        ? `To: ${tx.toAccountNum}` 
                                        : `From: ${tx.fromAccountNum}`}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <p className={`font-black ${
                              tx.toAccountNum === selectedAccount.accountNumber ? 'text-green-600' : 'text-slate-900'
                            }`}>
                              {tx.toAccountNum === selectedAccount.accountNumber ? `+₹${tx.amountVal.toLocaleString()}` : tx.amount}
                            </p>
                          </td>
                        </tr>
                      ))}
                    {transactionHistory.filter(tx => 
                      (tx.fromAccountNum === selectedAccount.accountNumber) || 
                      (tx.toAccountNum === selectedAccount.accountNumber)
                    ).length === 0 && (
                      <tr>
                        <td className="py-10 text-center text-slate-400 text-sm font-bold uppercase tracking-widest italic">No transactions found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
