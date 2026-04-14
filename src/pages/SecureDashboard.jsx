import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../components/SecureAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../lib/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import emailjs from '@emailjs/browser';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertCircle,
  History, 
  User as UserIcon, 
  Send,
  CreditCard,
  PlusCircle,
  Receipt,
  Smartphone,
  Briefcase,
  FileText,
  Download,
  ShieldCheck,
  Eye,
  EyeOff,
  Landmark,
  IndianRupee,
  Calendar,
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
  Loader2,
  KeyRound
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

const PaymentOtpVerification = ({ onVerify, onCancel, paymentOtp, paymentOtpInput, setPaymentOtpInput, setFormError }) => {
  const otpRefs = useRef([]);
  const [localSubmitting, setLocalSubmitting] = useState(false);

  useEffect(() => {
    // Auto-verify when 6 digits are entered
    if (paymentOtpInput.length === 6 && !localSubmitting) {
      if (paymentOtpInput === paymentOtp) {
        setLocalSubmitting(true);
        onVerify();
      } else {
        setFormError("Invalid verification code. Protocol mismatch. ❌");
      }
    }
  }, [paymentOtpInput, paymentOtp, localSubmitting]); // Removed onVerify/setFormError from deps to prevent re-triggers

  const handleOtpChange = (e, index) => {
    if (localSubmitting) return;
    const val = e.target.value.replace(/\D/g, '');
    const newOtpArr = paymentOtpInput.split('').slice(0, 6);
    
    // Ensure array has enough elements
    while (newOtpArr.length < 6) newOtpArr.push('');
    
    newOtpArr[index] = val.slice(-1);
    const newOtp = newOtpArr.join('').slice(0, 6);
    setPaymentOtpInput(newOtp);

    // Focus next input if a digit was entered
    if (val && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (localSubmitting) return;
    if (e.key === 'Backspace') {
      if (!paymentOtpInput[index] && index > 0) {
        // Move focus back if current is empty
        otpRefs.current[index - 1].focus();
      } else {
        // Clear current digit if not empty
        const newOtpArr = paymentOtpInput.split('');
        newOtpArr[index] = '';
        setPaymentOtpInput(newOtpArr.join(''));
      }
    }
  };

  return (
    <div className="space-y-6 animate-in zoom-in-95 duration-300">
      <div className="p-8 bg-white rounded-[32px] border border-slate-100 shadow-xl text-center space-y-6">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600 mb-2">
          {localSubmitting ? <Loader2 className="w-10 h-10 animate-spin" /> : <ShieldCheck size={40} />}
        </div>
        <div className="space-y-2">
          <h4 className="text-2xl font-black text-slate-900 tracking-tight">
            {localSubmitting ? 'Verifying Protocol...' : 'Security Verification'}
          </h4>
          <p className="text-slate-500 font-medium text-sm">
            {localSubmitting ? 'Authenticating with SmartBank Quantum Guard' : 'A 6-digit verification code has been dispatched to your registered email protocol.'}
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="flex justify-center gap-3">
            {[0, 1, 2, 3, 4, 5].map((idx) => (
              <input
                key={idx}
                ref={el => otpRefs.current[idx] = el}
                type="text"
                maxLength="1"
                disabled={localSubmitting}
                value={paymentOtpInput[idx] || ''}
                onChange={(e) => handleOtpChange(e, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={`w-12 h-16 bg-slate-50 border border-slate-100 rounded-xl text-center text-2xl font-black focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:bg-white transition-all ${localSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            ))}
          </div>
          
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {localSubmitting ? 'QUANTUM GUARD ACTIVE' : 'Authenticating via SmartBank Quantum Guard'}
          </p>
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="button" 
            onClick={onCancel}
            disabled={localSubmitting}
            className="w-1/3 h-14 bg-slate-200 text-slate-600 font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-slate-300 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={() => {
              if (paymentOtpInput === paymentOtp) {
                setLocalSubmitting(true);
                onVerify();
              } else {
                setFormError("Invalid verification code. Protocol mismatch. ❌");
              }
            }}
            disabled={paymentOtpInput.length !== 6 || localSubmitting}
            className="w-2/3 h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-xs disabled:opacity-50"
          >
            {localSubmitting ? <Loader2 size={18} className="animate-spin" /> : <>Verify & Pay <Check size={18} strokeWidth={3} /></>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function SecureDashboard() {
  const navigate = useNavigate();
  const { 
    userProfile, 
    logout, 
    addRequest, 
    requests, 
    userAccounts,
    serviceRequests,
    cards,
    loans,
    transactions,
    fetchLoanById,
    payLoanEMI,
    performTransfer,
    performPayment,
    payCardBill,
    fetchCardByNumber,
    changePassword,
    allUsers
  } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedAccount, setSelectedAccount] = useState(null); // State for account details modal
  const [selectedCard, setSelectedCard] = useState(null); // State for card details modal
  const [isPayingCardBill, setIsPayingCardBill] = useState(false); // State for card bill payment modal
  const [depositModal, setDepositModal] = useState(false); // State for deposit request modal
  const [depositAmount, setDepositAmount] = useState(''); // Amount for deposit
  const [isDepositing, setIsDepositing] = useState(false); // Loading state for deposit request
  const [selectedLoan, setSelectedLoan] = useState(null); // State for loan details modal
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
  const [fetchedLoan, setFetchedLoan] = useState(null); // State for fetched loan details
  const [fetchedCard, setFetchedCard] = useState(null); // State for fetched card details
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastPayment, setLastPayment] = useState(null);
  const [formError, setFormError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // OTP Payment Verification States
  const [paymentOtp, setPaymentOtp] = useState('');
  const [isPaymentOtpSent, setIsPaymentOtpSent] = useState(false);
  const [paymentOtpInput, setPaymentOtpInput] = useState('');
  const [isPaymentOtpVerifying, setIsPaymentOtpVerifying] = useState(false);

  const handleSendPaymentOTP = async (e) => {
    if (e) e.preventDefault();
    if (!userProfile?.email) {
      setFormError("User email protocol not found.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setPaymentOtp(newOtp);

    const SERVICE_ID = "service_4vexw9b";
    const TEMPLATE_ID = "template_heo7zv8";
    const PUBLIC_KEY = "I5wWVwwuUcAFQsyFb";

    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
        email: userProfile.email,
        to_email: userProfile.email,
        user_email: userProfile.email,
        recipient_email: userProfile.email,
        email_to: userProfile.email,
        otp: newOtp,
        to_name: `${userProfile.firstName} ${userProfile.lastName}`
      }, PUBLIC_KEY);
      
      setIsPaymentOtpSent(true);
      showToast(`Verification OTP dispatched to ${userProfile.email} ✅`);
    } catch (err) {
      setFormError("Failed to dispatch verification code. Please check your connection.");
      setIsPaymentOtpSent(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setFormError("New passwords do not match.");
      return;
    }
    if (passwordFormData.newPassword.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    setIsChangingPassword(true);
    setFormError("");
    try {
      const result = await changePassword(passwordFormData.currentPassword, passwordFormData.newPassword);
      if (result.success) {
        showToast("Password updated successfully! ✅");
        closeModal();
      } else {
        setFormError(result.message);
      }
    } catch (err) {
      setFormError("An error occurred. Please try again.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const downloadReceipt = (paymentData) => {
    const data = paymentData || lastPayment;
    if (!data) return;

    // Helper to trigger a real file download so it appears in "Recent download history"
    const triggerFileDownload = (content, filename) => {
      const blob = new Blob([content], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const receiptHtml = `
      <html>
        <head>
          <title>SmartBank Payment Receipt</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; display: flex; flex-direction: column; align-items: center; }
            .receipt-box { width: 450px; border: 1px solid #eee; padding: 30px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); background: white; }
            .header { text-align: center; border-bottom: 2px dashed #eee; padding-bottom: 20px; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: 900; text-transform: uppercase; }
            .logo span { color: #3b82f6; }
            .success-badge { display: inline-block; background: #ecfdf5; color: #10b981; padding: 5px 15px; rounded: 20px; font-size: 10px; font-weight: 900; text-transform: uppercase; margin-top: 10px; border-radius: 20px; }
            .amount { text-align: center; font-size: 36px; font-weight: 900; margin: 20px 0; color: #1e293b; }
            .details { font-size: 13px; color: #64748b; }
            .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; }
            .detail-label { font-weight: 600; }
            .detail-value { font-weight: 800; color: #1e293b; }
            .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #94a3b8; }
            .actions { margin-top: 30px; display: flex; gap: 15px; justify-content: center; }
            .btn { padding: 10px 20px; border-radius: 12px; font-size: 12px; font-weight: 900; text-transform: uppercase; cursor: pointer; border: none; transition: all 0.2s; }
            .btn-print { background: #1e293b; color: white; }
            .btn-download { background: #3b82f6; color: white; }
            @media print { .actions { display: none; } body { padding: 0; } .receipt-box { box-shadow: none; border: none; } }
          </style>
        </head>
        <body>
          <div class="receipt-box">
            <div class="header">
              <div class="logo">SMART<span>BANK</span></div>
              <div class="success-badge">Transaction Successful</div>
            </div>
            <div class="amount">₹${parseFloat(data.amount).toLocaleString()}</div>
            <div class="details">
              <div class="detail-row">
                <span class="detail-label">Payment For</span>
                <span class="detail-value">${data.type || 'Bill Payment'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Source</span>
                <span class="detail-value">${data.fromCard || data.fromAccount}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date & Time</span>
                <span class="detail-value">${new Date().toLocaleString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Ref ID</span>
                <span class="detail-value">${Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Remark</span>
                <span class="detail-value">${data.remark || 'N/A'}</span>
              </div>
            </div>
            <div class="footer">
              Thank you for banking with SmartBank.<br>This is a digital receipt.
            </div>
          </div>
          <div class="actions">
            <button class="btn btn-print" onclick="window.print()">Print Receipt</button>
            <button class="btn btn-download" id="downloadBtn">Download File</button>
          </div>
          <script>
            document.getElementById('downloadBtn').onclick = function() {
              const html = document.documentElement.outerHTML;
              const blob = new Blob([html], { type: 'text/html' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'SmartBank_Receipt_${Date.now()}.html';
              a.click();
            };
          </script>
        </body>
      </html>
    `;

    // Trigger immediate file download so it appears in history
    triggerFileDownload(receiptHtml, `SmartBank_Receipt_${Date.now()}.html`);

    // Also open the printable view as before
    const printWindow = window.open('', '_blank');
    printWindow.document.open();
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  const downloadHistory = () => {
    if (transactionHistory.length === 0) {
      showToast('No transactions to download.');
      return;
    }

    // Helper to trigger a real file download
    const triggerFileDownload = (content, filename) => {
      const blob = new Blob([content], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const rows = transactionHistory.map(tx => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px; text-align: left;">${tx.date}</td>
        <td style="padding: 12px; text-align: left;">${tx.name}</td>
        <td style="padding: 12px; text-align: right; color: ${tx.isNegative ? '#000' : '#10b981'}; font-weight: bold;">${tx.amount}</td>
        <td style="padding: 12px; text-align: left;">${tx.isNegative ? 'Debit' : 'Credit'}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <html>
        <head>
          <title>SmartBank Statement - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; }
            .logo span { color: #3b82f6; }
            .title { font-size: 20px; font-weight: 800; color: #666; text-transform: uppercase; letter-spacing: 2px; }
            .user-info { margin-bottom: 30px; }
            .user-info p { margin: 5px 0; font-size: 14px; font-weight: 600; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f8fafc; color: #64748b; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; padding: 12px; border-bottom: 2px solid #eee; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #eee; padding-top: 20px; }
            .actions { margin-bottom: 20px; text-align: right; }
            .btn { padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }
            @media print { .actions { display: none; } }
          </style>
        </head>
        <body>
          <div class="actions">
             <button class="btn" onclick="window.print()">Print / Save as PDF</button>
          </div>
          <div class="header">
            <div class="logo">SMART<span>BANK</span></div>
            <div class="title">Account Statement</div>
          </div>
          <div class="user-info">
            <p>Customer: ${userProfile?.firstName} ${userProfile?.lastName}</p>
            <p>Email: ${userProfile?.email || 'N/A'}</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th style="text-align: left;">Date</th>
                <th style="text-align: left;">Description</th>
                <th style="text-align: right;">Amount</th>
                <th style="text-align: left;">Type</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
          <div class="footer">
            This is a computer-generated document and does not require a physical signature. SmartBank E-Banking System.
          </div>
          <script>
            window.onload = function() { 
              // Don't auto-print here because we triggered a file download already
            }
          </script>
        </body>
      </html>
    `;

    // Trigger immediate file download so it appears in history
    triggerFileDownload(htmlContent, `SmartBank_Statement_${new Date().toLocaleDateString().replace(/\//g, '-')}.html`);

    // Also open the printable view
    const printWindow = window.open('', '_blank');
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    showToast('Statement generated and downloaded! 📥');
  };

  const downloadAccountStatement = (account) => {
    if (!account) return;

    const accTransactions = transactionHistory.filter(tx => 
      (tx.fromAccountNum === account.accountNumber) || 
      (tx.toAccountNum === account.accountNumber)
    );

    if (accTransactions.length === 0) {
      showToast('No transactions found for this account.');
      return;
    }

    const rows = accTransactions.map(tx => {
      const isCredit = tx.toAccountNum === account.accountNumber;
      return `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px; text-align: left;">${tx.date}</td>
          <td style="padding: 12px; text-align: left;">${tx.name}</td>
          <td style="padding: 12px; text-align: right; color: ${isCredit ? '#10b981' : '#000'}; font-weight: bold;">
            ${isCredit ? `+₹${tx.amountVal.toLocaleString()}` : `-₹${tx.amountVal.toLocaleString()}`}
          </td>
          <td style="padding: 12px; text-align: left;">${isCredit ? 'Credit' : 'Debit'}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <html>
        <head>
          <title>SmartBank Statement - ${account.accountNumber}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; }
            .logo span { color: #3b82f6; }
            .title { font-size: 20px; font-weight: 800; color: #666; text-transform: uppercase; letter-spacing: 2px; }
            .info-grid { display: grid; grid-cols: 2; gap: 20px; margin-bottom: 30px; }
            .info-box { background: #f8fafc; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; }
            .info-label { font-size: 10px; font-weight: 900; color: #64748b; text-transform: uppercase; margin-bottom: 5px; }
            .info-value { font-size: 16px; font-weight: 800; color: #1e293b; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f8fafc; color: #64748b; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; padding: 12px; border-bottom: 2px solid #eee; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #eee; padding-top: 20px; }
            .actions { margin-bottom: 20px; text-align: right; }
            .btn { padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }
            @media print { .actions { display: none; } }
          </style>
        </head>
        <body>
          <div class="actions">
             <button class="btn" onclick="window.print()">Print / Save as PDF</button>
          </div>
          <div class="header">
            <div class="logo">SMART<span>BANK</span></div>
            <div class="title">Account Statement</div>
          </div>
          <div style="display: flex; gap: 20px; margin-bottom: 30px;">
            <div class="info-box" style="flex: 1;">
              <div class="info-label">Customer Details</div>
              <div class="info-value">${account.userName || `${userProfile?.firstName} ${userProfile?.lastName}`}</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 5px;">${userProfile?.email || ''}</div>
            </div>
            <div class="info-box" style="flex: 1;">
              <div class="info-label">Account Details</div>
              <div class="info-value">${account.accountNumber}</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 5px;">Type: ${account.accountType} | Balance: ₹${account.balance.toLocaleString()}</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="text-align: left;">Date</th>
                <th style="text-align: left;">Description</th>
                <th style="text-align: right;">Amount</th>
                <th style="text-align: left;">Type</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
          <div class="footer">
            Generated on ${new Date().toLocaleString()}. This is a computer-generated document. SmartBank E-Banking System.
          </div>
        </body>
      </html>
    `;

    // Helper to trigger download
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Statement_${account.accountNumber}_${Date.now()}.html`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const printWindow = window.open('', '_blank');
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    showToast('Account statement generated! 📥');
  };

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

  // Legacy support: Requests marked as 'clerk_approved' or 'manager_approved' but not yet in the official 'accounts' collection
  const approvedRequests = userRequests.filter(req => 
    req.category === 'account' && (req.status === 'clerk_approved' || req.status === 'manager_approved')
  );
  
  // Combine official accounts and approved requests for display in Accounts tab
  const allAccounts = [
    ...userAccounts.map(acc => {
      const accNum = acc.accountNumber;
      
      // For Official Accounts, we trust the DB balance as the primary source
      // We don't add/subtract transactions here because performTransfer already updates the DB document
      return {
        id: acc.id,
        accountNumber: accNum,
        accountType: acc.accountType,
        balance: parseFloat(acc.balance || 0),
        createdAt: acc.createdAt,
        status: 'Active',
        isOfficial: true,
        details: acc.details || {},
        nomineeName: acc.nomineeName || acc.details?.nomineeName,
        nomineeRelation: acc.nomineeRelation || acc.details?.nomineeRelation,
        userName: acc.userName || `${userProfile?.firstName} ${userProfile?.lastName}`
      };
    }),
    ...approvedRequests.map(req => {
      const accNum = getSimulatedAccNum(req.id);
      
      // For Simulated Accounts (not yet in DB 'accounts' collection), 
      // we must calculate balance from initial deposit + transactions
      const initialDeposit = parseFloat(req.details?.deposit || 0);

      const totalSentTx = transactions
        .filter(tx => tx.amount < 0 && tx.fromAccount === accNum)
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      
      const totalReceivedTx = transactions
        .filter(tx => tx.amount >= 0 && tx.toAccount === accNum)
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

      return {
        id: req.id,
        accountNumber: accNum,
        accountType: req.details?.accountType || 'Saving',
        balance: initialDeposit - totalSentTx + totalReceivedTx,
        createdAt: req.createdAt,
        status: 'Approved',
        isOfficial: false,
        details: req.details || {},
        nomineeName: req.nomineeName || req.details?.nomineeName,
        nomineeRelation: req.nomineeRelation || req.details?.nomineeRelation,
        userName: req.userName || `${userProfile?.firstName} ${userProfile?.lastName}`
      };
    })
  ];

  // Build a map of account numbers to names from all available transactions to resolve missing names
  const accountNameMap = {};
  transactions.forEach(tx => {
    if (tx.fromAccount && tx.senderName && tx.senderName !== 'External' && tx.senderName !== 'System') {
      accountNameMap[tx.fromAccount] = tx.senderName;
    }
    if (tx.toAccount && tx.recipientName && tx.recipientName !== 'External' && tx.recipientName !== 'System') {
      accountNameMap[tx.toAccount] = tx.recipientName;
    }
  });

  // Prepare real transaction history from user requests AND the new transactions collection
  const transactionHistory = [
    ...userRequests
      .filter(req => req.category === 'account') // Monetry movements now primarily from 'transactions'
      .flatMap(req => {
        let amountVal = parseFloat(req.details?.amount || req.details?.deposit || 0);
        let status = req.status === 'pending_clerk' ? 'Clerk Review' : 
                     req.status === 'clerk_approved' ? 'Manager Review' : 
                     req.status.charAt(0).toUpperCase() + req.status.slice(1);
        
        const entries = [];
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
        }
        return entries;
      }),
    ...transactions.map(tx => {
      const fromAcc = allAccounts.find(a => a.accountNumber === tx.fromAccount);
      const toAcc = allAccounts.find(a => a.accountNumber === tx.toAccount);
      
      // Label for Sender: Show Account Number + Name
      const senderName = tx.senderName || fromAcc?.userName || accountNameMap[tx.fromAccount] || (tx.amount < 0 ? `${userProfile?.firstName} ${userProfile?.lastName}` : 'External');
      const fromLabel = tx.fromAccount ? `${tx.fromAccount}(${senderName})` : 'External';
      
      // Label for Recipient: Show Account Number + Name
      const recipientName = tx.recipientName || toAcc?.userName || accountNameMap[tx.toAccount] || (tx.amount >= 0 ? `${userProfile?.firstName} ${userProfile?.lastName}` : 'System');
      const toLabel = tx.toAccount ? `${tx.toAccount}(${recipientName})` : 'System';
      
      return {
        id: tx.id,
        name: tx.type === 'Transfer' ? `from ${fromLabel}-to-${toLabel}` : (tx.remark || tx.type),
        date: formatAccountDate(tx.timestamp),
        rawDate: tx.timestamp,
        amount: `${tx.amount >= 0 ? '+' : '-'}₹${Math.abs(tx.amount).toLocaleString()}`,
        amountVal: Math.abs(tx.amount),
        status: 'Approved',
        icon: tx.amount >= 0 ? '💰' : '💸',
        isNegative: tx.amount < 0,
        fromAccountNum: tx.fromAccount,
        toAccountNum: tx.toAccount,
        category: tx.type?.toLowerCase() || 'transfer'
      };
    })
  ].sort((a, b) => {
    const dateA = getDateObject(a.rawDate);
    const dateB = getDateObject(b.rawDate);
    return dateB.getTime() - dateA.getTime();
  });

  // Calculate real Inflow and Outflow
  // We exclude self-transfers (transfers between user's own accounts) for accurate stats
  const userAccountNums = allAccounts.map(a => a.accountNumber);
  
  const totalInflow = transactionHistory
    .filter(tx => !tx.isNegative && ['approved', 'Approved', 'Manager Review', 'Clerk Review', 'Pending'].includes(tx.status))
    .filter(tx => !(tx.category === 'transfer' && userAccountNums.includes(tx.fromAccountNum))) // Exclude self-credits
    .reduce((sum, tx) => sum + tx.amountVal, 0);
  
  const totalOutflow = transactionHistory
    .filter(tx => tx.isNegative && ['approved', 'Approved', 'Manager Review', 'Clerk Review', 'Pending'].includes(tx.status))
    .filter(tx => !(tx.category === 'transfer' && userAccountNums.includes(tx.toAccountNum))) // Exclude self-debits
    .reduce((sum, tx) => sum + tx.amountVal, 0);

  // Calculate real total balance: Sum of all account balances in allAccounts
  const totalBalance = allAccounts.reduce((sum, acc) => sum + (parseFloat(acc.balance) || 0), 0);

  // --- Dynamic Insights Data Calculation ---
  
  // 1. Spending Analysis (Negative Transactions by Category)
  const spendingByCategory = transactionHistory
    .filter(tx => tx.isNegative && ['approved', 'Approved', 'Manager Review', 'Clerk Review', 'Pending'].includes(tx.status))
    .reduce((acc, tx) => {
      let cat = 'Other';
      if (tx.name.toLowerCase().includes('electricity') || tx.name.toLowerCase().includes('bill')) cat = 'Utilities';
      else if (tx.name.toLowerCase().includes('recharge') || tx.name.toLowerCase().includes('mobile')) cat = 'Recharge';
      else if (tx.name.toLowerCase().includes('loan') || tx.name.toLowerCase().includes('emi')) cat = 'Loan EMI';
      else if (tx.name.toLowerCase().includes('card') || tx.name.toLowerCase().includes('cc')) cat = 'Card Payments';
      else if (tx.category === 'transfer') cat = 'Transfers';
      
      acc[cat] = (acc[cat] || 0) + tx.amountVal;
      return acc;
    }, {});

  const totalSpending = Object.values(spendingByCategory).reduce((a, b) => a + b, 0);
  const spendingAnalysisData = Object.entries(spendingByCategory)
    .map(([label, amount]) => ({
      label,
      amount: `₹${amount.toLocaleString()}`,
      amountVal: amount,
      color: label === 'Utilities' ? 'bg-amber-500' : 
             label === 'Recharge' ? 'bg-purple-500' :
             label === 'Loan EMI' ? 'bg-rose-500' :
             label === 'Card Payments' ? 'bg-indigo-600' : 
             label === 'Transfers' ? 'bg-emerald-500' : 'bg-blue-600',
      icon: label === 'Utilities' ? <Zap size={14} /> : 
            label === 'Recharge' ? <Smartphone size={14} /> :
            label === 'Loan EMI' ? <Briefcase size={14} /> :
            label === 'Card Payments' ? <CreditCard size={14} /> : 
            label === 'Transfers' ? <Send size={14} /> : <PieChart size={14} />,
      width: totalSpending > 0 ? `${(amount / totalSpending) * 100}%` : '0%'
    }))
    .sort((a, b) => b.amountVal - a.amountVal);

  // 2. Wealth Growth (Daily Inflow/Outflow for last 7 days)
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toLocaleDateString('en-IN', { weekday: 'short' });
  }).reverse();

  const dailyWealthData = last7Days.map(day => {
    const dailyTotal = transactionHistory
      .filter(tx => {
        const txDate = getDateObject(tx.rawDate).toLocaleDateString('en-IN', { weekday: 'short' });
        return txDate === day && ['approved', 'Approved', 'Manager Review', 'Clerk Review', 'Pending'].includes(tx.status);
      })
      .reduce((sum, tx) => sum + (tx.isNegative ? -tx.amountVal : tx.amountVal), 0);
    
    // Map to a height percentage for the bar chart (0-100)
    // Using a base of 50 as "neutral" and scaling based on activity
    const height = Math.min(Math.max(40 + (dailyTotal / 1000) * 10, 20), 100); 
    return { day, height, dailyTotal };
  });

  const handleFetchLoan = async (loanIdToFetch) => {
    const searchId = loanIdToFetch || formData.refNum;
    if (!searchId) {
      setFormError('Please enter a Loan ID.');
      return;
    }
    setCheckingBill(true);
    setFormError('');
    try {
      const loan = await fetchLoanById(searchId);
      if (loan) {
        setFetchedLoan(loan);
        setFormData(prev => ({ 
          ...prev, 
          refNum: searchId,
          cardHolder: loan.userName,
          amount: loan.emi 
        }));
      } else {
        setFetchedLoan(null);
        if (loanIdToFetch) {
          // If auto-fetching and not found, don't necessarily show error immediately
        } else {
          setFormError('Invalid Loan ID or Loan not found.');
        }
      }
    } catch (err) {
      setFormError('Error searching for loan.');
    } finally {
      setCheckingBill(false);
    }
  };

  const handleFetchCard = async (cardNumber) => {
    if (!cardNumber) return;
    setCheckingBill(true);
    setFormError('');
    try {
      const card = await fetchCardByNumber(cardNumber);
      if (card) {
        setFetchedCard(card);
        setFormData(prev => ({ 
          ...prev, 
          cardHolder: card.userName,
          // Mock bill details for now
          amount: (card.limit * 0.25).toFixed(2) // Mock: 25% of limit is due
        }));
      } else {
        setFetchedCard(null);
        setFormError('Credit Card not found or not registered with SmartBank.');
      }
    } catch (err) {
      setFormError('Error searching for credit card.');
    } finally {
      setCheckingBill(false);
    }
  };

  const [modal, setModal] = useState({
    isOpen: false,
    type: '',
    title: ''
  });

  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formStep, setFormStep] = useState(1);

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
    setPasswordFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setDepositModal(false);
    setDepositAmount('');
    setIsDepositing(false);
    setPaymentOtp('');
    setIsPaymentOtpSent(false);
    setPaymentOtpInput('');
    setIsPaymentOtpVerifying(false);
  };

  const handleDepositRequest = async (e) => {
    e.preventDefault();
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setFormError('Please enter a valid amount.');
      return;
    }

    setIsDepositing(true);
    setFormError('');

    try {
      const depositData = {
        userName: `${userProfile?.firstName} ${userProfile?.lastName}`,
        type: 'Deposit Request',
        category: 'account',
        status: 'pending',
        userId: userProfile.uid,
        createdAt: new Date().toISOString(),
        details: {
          accountNumber: selectedAccount.accountNumber,
          accountId: selectedAccount.id,
          amount: parseFloat(depositAmount),
          accountType: selectedAccount.accountType || 'saving'
        }
      };

      await addRequest(depositData);
      setDepositModal(false);
      setDepositAmount('');
      setSelectedAccount(null);
      showToast('Deposit request submitted! Once approved by the clerk, the amount will be credited to your account.');
    } catch (err) {
      console.error("Deposit request failed:", err);
      setFormError('Failed to submit deposit request. Please try again.');
    } finally {
      setIsDepositing(false);
    }
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
    setPasswordFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPaymentOtp('');
    setIsPaymentOtpSent(false);
    setPaymentOtpInput('');
    setIsPaymentOtpVerifying(false);
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
    let { name, value } = e.target;
    
    // Auto-uppercase Loan IDs and PAN for better UX
    if (name === 'refNum' && formData.billCategory === 'loan-emi') {
      value = value.toUpperCase();
    }
    if (name === 'pan') {
      value = value.toUpperCase();
    }

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      // Reset dependent fields in electricity flow
      if (name === 'state') updated.board = '';
      if (name === 'board' || name === 'state') updated.city = '';
      
      // Credit Card Flow Logic
      if (name === 'refNum' && prev.billCategory === 'credit-card') {
        // Auto-format card number as XXXX XXXX XXXX XXXX
        let clean = value.replace(/\s/g, '').replace(/\D/g, '');
        let formatted = '';
        for (let i = 0; i < clean.length; i++) {
          if (i > 0 && i % 4 === 0) formatted += ' ';
          formatted += clean[i];
        }
        updated.refNum = formatted;
        
        // Trigger fetch when 16 digits (19 chars with spaces) are entered
        if (clean.length === 16) {
          handleFetchCard(formatted);
        }
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
        setFetchedLoan(null);
        setFetchedCard(null);
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
          updated.amount = '';
          updated.cardHolder = '';
          setFetchedLoan(null);
        }
      }

      // Auto-fetch Loan details if ID matches
      if (name === 'refNum' && prev.billCategory === 'loan-emi') {
        // Reset fetched loan if refNum changes
        setFetchedLoan(null);
        updated.cardHolder = '';
        
        // Auto-fetch if the ID looks complete (starts with L- and has 11 chars total)
        if (value.startsWith('L-') && value.length >= 11) {
          handleFetchLoan(value);
        }
      }
      
      return updated;
    });
    if (formError) setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // VALIDATION: Request Services
    if (modal.type === 'request-services') {
      if (formData.serviceType === 'credit-card') {
        closeModal();
        navigate('/apply-credit-card');
        return;
      }
      if (formData.serviceType === 'debit-card') {
        closeModal();
        navigate('/apply-debit-card');
        return;
      }
      if (formData.serviceType === 'loan') {
        closeModal();
        navigate('/apply-personal-loan');
        return;
      }
      if (formData.serviceType === 'kyc') {
        closeModal();
        navigate('/apply-kyc');
        return;
      }
    }

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
      const isCardSource = formData.paymentSourceType === 'card';
      const sourceId = isCardSource ? formData.fromCard : formData.fromAccount;

      if (!sourceId || !formData.amount) {
        setFormError(`${isCardSource ? 'Card' : 'Account'} and amount are required.`);
        return;
      }
      
      const paymentAmt = parseFloat(formData.amount);
      if (paymentAmt <= 0) {
        setFormError('Amount must be greater than zero.');
        return;
      }

      if (isCardSource) {
        const sourceCard = cards.find(c => c.cardNumber === formData.fromCard);
        if (!sourceCard) {
          setFormError('Source card not found.');
          return;
        }
        if (sourceCard.cardType === 'Credit') {
          const usedLimit = parseFloat(sourceCard.usedLimit || 0);
          if (usedLimit + paymentAmt > parseFloat(sourceCard.limit)) {
            setFormError(`Insufficient credit limit! Card only has ₹${(parseFloat(sourceCard.limit) - usedLimit).toLocaleString()} available.`);
            return;
          }
        } else {
          // Debit card checks linked account
          const linkedAcc = allAccounts.find(acc => acc.accountNumber === sourceCard.accountNumber);
          if (!linkedAcc) {
            setFormError('Linked account for this debit card not found.');
            return;
          }
          
          // Minimum Balance Check for Debit Card
          const minBalance = linkedAcc.accountType?.toLowerCase() === 'current' ? 10000 : 500;
          if (linkedAcc.balance - paymentAmt < minBalance) {
            setFormError(`Insufficient balance! Your linked ${linkedAcc.accountType} account must maintain a minimum balance of ₹${minBalance.toLocaleString()}. Current balance: ₹${linkedAcc.balance.toLocaleString()}.`);
            return;
          }
        }
      } else {
        const sourceAcc = allAccounts.find(acc => acc.accountNumber === formData.fromAccount);
        if (!sourceAcc) {
          setFormError('Source account not found.');
          return;
        }

        // Minimum Balance Check
        const minBalance = sourceAcc.accountType?.toLowerCase() === 'current' ? 10000 : 500;
        if (sourceAcc.balance - paymentAmt < minBalance) {
          setFormError(`Insufficient balance! Your ${sourceAcc.accountType} account must maintain a minimum balance of ₹${minBalance.toLocaleString()}. Current balance: ₹${sourceAcc.balance.toLocaleString()}.`);
          return;
        }

        // Daily Transfer Limit Check for Saving Account (Transfer only)
        if (modal.type === 'transfer' && sourceAcc.accountType?.toLowerCase() === 'saving') {
          const dailyLimit = 50000;
          
          // Calculate today's transfers for this account from transactions list
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const todayTransfers = transactions
            .filter(t => 
              t.fromAccount === sourceAcc.accountNumber && 
              t.type === 'Transfer' && 
              new Date(t.timestamp?.seconds * 1000 || t.timestamp).getTime() >= today.getTime()
            )
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

          if (todayTransfers + paymentAmt > dailyLimit) {
            setFormError(`Daily transfer limit exceeded! Saving accounts can transfer up to ₹${dailyLimit.toLocaleString()} per day. Remaining limit: ₹${(dailyLimit - todayTransfers).toLocaleString()}.`);
            return;
          }
        }
      }

      if (modal.type === 'transfer' && !formData.recipient) {
        setFormError('Recipient is required.');
        return;
      }
    }

    setSubmitting(true);
    console.log(`[USER-DASHBOARD] Submitting ${modal.type}...`, formData);

    // OTP Verification for Transfer & Bill Pay
    if ((modal.type === 'transfer' || modal.type === 'bill-pay') && !isPaymentOtpSent) {
      handleSendPaymentOTP();
      return;
    }
    
    const userName = `${userProfile?.firstName || 'User'} ${userProfile?.lastName || ''}`.trim();
    
    // Categorize based on modal type
    let category = 'service';
    if (modal.type === 'new-account') category = 'account';
    if (modal.type === 'transfer') category = 'transfer';
    if (modal.type === 'bill-pay') category = 'payment';

    // Fund Transfer Success Animation & Auto-Approval
    if (modal.type === 'transfer' || modal.type === 'bill-pay') {
      const isTransfer = modal.type === 'transfer';
      
      const processTransfer = async () => {
        try {
          const paymentDetails = {
            amount: parseFloat(formData.amount),
            fromAccount: formData.fromAccount,
            fromCard: formData.fromCard,
            type: isTransfer ? 'Fund Transfer' : (formData.billCategory || modal.title),
            remark: formData.remark || formData.note || (isTransfer ? 'Fund Transfer' : `${modal.title}: ${formData.billCategory || 'Bill'}`)
          };

          if (isTransfer) {
            const sourceAcc = allAccounts.find(acc => acc.accountNumber === formData.fromAccount);
            const result = await performTransfer({
              fromAccountId: sourceAcc.id,
              toAccountNumber: formData.recipient,
              recipientName: formData.recipientName,
              amount: parseFloat(formData.amount),
              remark: formData.remark || 'Fund Transfer'
            });
            
            if (!result.success) throw new Error(result.message);
            setTransferSuccess(true);
          } else {
            // Use the new performPayment helper to debit the account/card and record the transaction
            const result = await performPayment({
              fromAccountNumber: formData.fromAccount,
              fromCardNumber: formData.fromCard,
              amount: parseFloat(formData.amount),
              type: 'Payment',
              remark: `${modal.title} (${formData.fromCard || formData.fromAccount}): ${formData.billCategory || 'Bill'}`,
              billCategory: formData.billCategory || 'System'
            });

            if (!result.success) throw new Error(result.message);

            // Still add to user_requests for the "approved" status in the request list
            await addRequest({
              userId: userProfile?.uid,
              userName,
              type: modal.title,
              category,
              details: formData,
              status: 'approved'
            });
          }

          setLastPayment(paymentDetails);

          setTimeout(() => {
            showToast(`${isTransfer ? `₹${formData.amount} transferred` : 'Bill paid'} successfully! ✅`);
            
            // Ask user if they want to download receipt via a custom confirm or just auto-trigger
            // Auto-triggering is cleaner as per user request "it gunrate recipt and this recipt user can download"
            downloadReceipt(paymentDetails);

            closeModal();
            setTransferSuccess(false);
            setSubmitting(false);
          }, 2000);
        } catch (err) {
          setFormError(err.message);
          setSubmitting(false);
        }
      };

      setTimeout(processTransfer, 1500);
      return;
    }

    if (modal.type === 'change-password') {
      handlePasswordChange(e);
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
                                <div className="flex flex-col items-end gap-1">
                                  <p className={`text-base xl:text-xl font-black ${!tx.isNegative ? 'text-emerald-600' : 'text-slate-900'}`}>{tx.amount}</p>
                                  <button 
                                    onClick={() => downloadReceipt({
                                      amount: tx.amountVal,
                                      fromAccount: tx.fromAccountNum,
                                      type: tx.name,
                                      remark: tx.name
                                    })}
                                    className="p-1.5 hover:bg-blue-50 text-slate-300 hover:text-blue-600 rounded-lg transition-all"
                                  >
                                    <Download size={12} />
                                  </button>
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
                          <div className="flex flex-col">
                            <p className="font-bold text-slate-900 uppercase">{acc.accountType || 'Saving'}</p>
                            {(acc.accountType?.toLowerCase() === 'saving' || acc.accountType?.toLowerCase() === 'fd') && (
                              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">
                                {acc.accountType?.toLowerCase() === 'fd' ? '6% p.a. Int.' : '3% p.a. Int.'}
                              </p>
                            )}
                          </div>
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
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900">Recent Payments</h3>
                <button onClick={() => setActiveTab('history')} className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline">View All Statement</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-slate-50">
                    {transactionHistory.filter(tx => tx.category === 'payment' || tx.category === 'transfer').length > 0 ? (
                      transactionHistory
                        .filter(tx => tx.category === 'payment' || tx.category === 'transfer')
                        .slice(0, 5)
                        .map((tx) => (
                        <tr key={tx.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${tx.isNegative ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                {tx.icon}
                              </div>
                              <div>
                                <p className="font-black text-slate-900">{tx.name}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{tx.date}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex flex-col items-end gap-2">
                              <p className={`text-lg font-black ${tx.isNegative ? 'text-slate-900' : 'text-emerald-600'}`}>{tx.amount}</p>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Processed ✅</span>
                                <button 
                                  onClick={() => downloadReceipt({
                                    amount: tx.amountVal,
                                    fromAccount: tx.fromAccountNum,
                                    type: tx.name,
                                    remark: tx.name
                                  })}
                                  className="p-1.5 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-all"
                                >
                                  <Download size={12} />
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="p-20 text-center">
                          <History size={48} className="text-slate-200 mx-auto mb-4" />
                          <p className="text-slate-400 font-black uppercase tracking-widest italic">No recent payments found.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Notifications Section */}
            {userRequests.filter(r => r.category === 'payment').length > 0 && (
              <div className="mt-12 space-y-6">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                  <Bell className="text-blue-600" /> Payment Notifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userRequests.filter(r => r.category === 'payment').slice(0, 4).map(req => (
                    <div key={req.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4 hover:border-blue-200 transition-all">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        req.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                        req.status === 'rejected' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'
                      }`}>
                        {req.status === 'approved' ? <CheckCircle2 size={18} /> :
                         req.status === 'rejected' ? <X size={18} /> : <Clock size={18} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-black text-slate-900 text-sm">{req.type}</p>
                          <span className="text-[10px] font-black text-slate-400 uppercase">{formatAccountDate(req.createdAt)}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-500 leading-relaxed">
                          Your payment of ₹{parseFloat(req.details?.amount || 0).toLocaleString()} is {req.status === 'approved' ? 'successfully processed' : req.status === 'rejected' ? 'declined by bank' : 'being processed'}.
                        </p>
                        {req.clerkRemark && (
                          <div className="mt-3 p-3 bg-rose-50/50 rounded-xl border-l-2 border-rose-500">
                            <p className="text-[10px] font-black text-rose-600 italic">" {req.clerkRemark} "</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3 text-blue-600">
                  <PieChart size={20} />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Advanced Analytics Engine</span>
                </div>
                <h2 className="text-4xl xl:text-5xl font-black text-slate-900 tracking-tighter">Financial Insights</h2>
                <p className="text-slate-500 font-medium text-lg mt-2">Real-time breakdown of your capital flow and spending habits.</p>
              </div>
              <div className="flex gap-4">
                <button className="px-6 py-3 bg-white border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-all shadow-sm">Export Report</button>
                <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl">Last 30 Days</button>
              </div>
            </div>

            {/* Key Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-[40px] p-8 shadow-xl border border-slate-50 group hover:-translate-y-2 transition-all duration-500">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                  <IndianRupee size={24} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg. Monthly Spending</p>
                <h3 className="text-3xl font-black text-slate-900">₹{(totalSpending / (transactionHistory.length > 0 ? 1 : 1)).toLocaleString()}</h3>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-emerald-500 font-black text-[10px]">↓ 8.2%</span>
                  <span className="text-slate-400 text-[10px] font-medium uppercase tracking-widest">vs Last Month</span>
                </div>
              </div>
              <div className="bg-white rounded-[40px] p-8 shadow-xl border border-slate-50 group hover:-translate-y-2 transition-all duration-500">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-500">
                  <CheckCircle2 size={24} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Savings Efficiency</p>
                <h3 className="text-3xl font-black text-slate-900">{totalInflow > 0 ? Math.round(((totalInflow - totalOutflow) / totalInflow) * 100) : 0}%</h3>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-blue-600 font-black text-[10px]">Optimal Range</span>
                  <span className="text-slate-400 text-[10px] font-medium uppercase tracking-widest">Based on Tier</span>
                </div>
              </div>
              <div className="bg-white rounded-[40px] p-8 shadow-xl border border-slate-50 group hover:-translate-y-2 transition-all duration-500">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-500">
                  <AlertCircle size={24} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Top Expense Category</p>
                <h3 className="text-3xl font-black text-slate-900">{spendingAnalysisData[0]?.label || 'None'}</h3>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-rose-500 font-black text-[10px]">Check Bills</span>
                  <span className="text-slate-400 text-[10px] font-medium uppercase tracking-widest">Manual Review</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Spending Analysis */}
              <div className="lg:col-span-2 bg-white rounded-[48px] p-10 xl:p-12 shadow-2xl border border-slate-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-slate-50 rounded-full blur-[100px] -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-12">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Spending Analysis</h3>
                    <div className="p-3 bg-slate-50 rounded-xl text-slate-400"><PieChart size={20} /></div>
                  </div>
                  <div className="space-y-10">
                    {spendingAnalysisData.length > 0 ? (
                      spendingAnalysisData.map((item, i) => (
                        <div key={i} className="group cursor-default">
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 ${item.color.replace('bg-', 'bg-').replace('500', '100').replace('600', '100')} ${item.color.replace('bg-', 'text-')} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                {item.icon}
                              </div>
                              <span className="font-black text-slate-900 uppercase text-[10px] tracking-widest">{item.label}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-black text-slate-900 block">{item.amount}</span>
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{Math.round(parseFloat(item.width))}% of Total</span>
                            </div>
                          </div>
                          <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5 shadow-inner">
                            <div className={`h-full ${item.color} rounded-full transition-all duration-1000 group-hover:brightness-110 relative`} style={{ width: item.width }}>
                              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-32 text-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 text-slate-200">
                          <PieChart size={48} />
                        </div>
                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs italic">No spending data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Wealth Growth */}
              <div className="lg:col-span-3 bg-slate-900 rounded-[48px] p-10 xl:p-12 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                <div className="absolute top-0 right-0 p-48 bg-blue-600/20 rounded-full blur-[120px] -mr-24 -mt-24 group-hover:scale-110 transition-transform duration-1000"></div>
                
                <div className="relative z-10 flex items-center justify-between mb-16">
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">Wealth Growth</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Net daily capital movement</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Profit</span>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <div className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Expense</span>
                    </div>
                  </div>
                </div>

                <div className="h-80 flex items-end gap-4 xl:gap-6 relative z-10 px-4">
                  {dailyWealthData.map((item, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-4 group/bar h-full justify-end">
                      <div className="opacity-0 group-hover/bar:opacity-100 transition-all duration-300 -translate-y-2 group-hover/bar:translate-y-0 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-2 rounded-xl text-[10px] font-black whitespace-nowrap mb-2 shadow-2xl">
                        <span className={item.dailyTotal >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {item.dailyTotal >= 0 ? '+' : ''}₹{Math.abs(item.dailyTotal).toLocaleString()}
                        </span>
                      </div>
                      <div 
                        className={`w-full relative ${item.dailyTotal >= 0 ? 'bg-gradient-to-t from-blue-700 to-blue-400 hover:from-blue-600 hover:to-blue-300' : 'bg-gradient-to-t from-rose-700 to-rose-400 hover:from-rose-600 hover:to-rose-300'} rounded-t-2xl xl:rounded-t-[32px] transition-all duration-1000 shadow-2xl cursor-pointer overflow-hidden group/chartbar`} 
                        style={{ height: `${item.height}%` }} 
                      >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/chartbar:opacity-100 transition-opacity" />
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white/30 rounded-full" />
                      </div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover/bar:text-white transition-colors">{item.day}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between relative z-10">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Weekly Performance</span>
                    <span className="text-xl font-black text-emerald-400">+₹{dailyWealthData.reduce((s, d) => s + (d.dailyTotal > 0 ? d.dailyTotal : 0), 0).toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</span>
                    <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-tighter border border-white/20 backdrop-blur-sm">Trending Upwards</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'cards':
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">My Card Portfolio</h2>
                <p className="text-slate-500 font-medium">Manage your active credit and debit cards.</p>
              </div>
              <button 
                onClick={() => navigate('/apply-credit-card')} 
                className="px-8 py-4 bg-blue-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/20 flex items-center gap-3"
              >
                <PlusCircle size={20} /> Request New Card
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {cards.map((card, i) => (
                <div key={card.id || i} className="group flex flex-col bg-white rounded-[40px] shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500">
                  {/* Card Visual */}
                  <div className="relative aspect-[1.58/1] m-4 rounded-[32px] overflow-hidden shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                    <div className={`absolute inset-0 bg-gradient-to-br ${i % 2 === 0 ? 'from-slate-900 via-slate-800 to-slate-900' : 'from-blue-700 via-indigo-800 to-blue-900'} p-8 text-white flex flex-col justify-between`}>
                      <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-[80px] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
                      
                      <div className="relative z-10 flex justify-between items-start">
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">SmartBank {card.cardType} {card.category !== 'Credit' ? card.category : ''}</p>
                          <h4 className="text-lg font-bold tracking-tight">{card.cardType === 'Debit' ? 'Instant Access' : 'Premium Signature'}</h4>
                        </div>
                        <div className="w-12 h-8 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-white/20 -mr-2" />
                          <div className="w-6 h-6 rounded-full bg-white/20" />
                        </div>
                      </div>

                      <div className="relative z-10 space-y-1">
                        <p className="text-xl xl:text-2xl font-mono tracking-[0.2em] font-black text-white/90">
                          {card.cardNumber.replace(/\d(?=\d{4})/g, "•")}
                        </p>
                        <div className="flex gap-6">
                          <div>
                            <p className="text-[7px] font-black uppercase tracking-widest text-white/40 mb-0.5">Expiry</p>
                            <p className="text-xs font-bold">{card.expiry}</p>
                          </div>
                          <div>
                            <p className="text-[7px] font-black uppercase tracking-widest text-white/40 mb-0.5">CVV</p>
                            <p className="text-xs font-bold">***</p>
                          </div>
                        </div>
                      </div>

                      <div className="relative z-10 flex justify-between items-end">
                        <div>
                          <p className="text-[7px] font-black uppercase tracking-widest text-white/40 mb-0.5">Card Holder</p>
                          <p className="text-xs font-black uppercase tracking-widest">{card.userName}</p>
                        </div>
                        <div className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                          {card.cardType === 'Debit' ? (
                            <>
                              <p className="text-[7px] font-black uppercase tracking-widest text-white/40 leading-none mb-0.5">Account Balance</p>
                              <p className="text-[10px] font-black">₹{(allAccounts.find(acc => acc.accountNumber === card.accountNumber)?.balance || 0).toLocaleString()}</p>
                            </>
                          ) : (
                            <>
                              <p className="text-[7px] font-black uppercase tracking-widest text-white/40 leading-none mb-0.5">Available Limit</p>
                              <p className="text-[10px] font-black">₹{(parseFloat(card.limit) - parseFloat(card.usedLimit || 0)).toLocaleString()}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Usage Stats */}
                  <div className="px-8 pb-8 pt-2 space-y-6">
                    {(() => {
                      const isDebit = card.cardType === 'Debit';
                      const linkedAcc = allAccounts.find(acc => acc.accountNumber === card.accountNumber);
                      const balance = linkedAcc?.balance || 0;
                      const used = parseFloat(card.usedLimit || 0);
                      const totalCapacity = isDebit ? (balance + used) : parseFloat(card.limit);
                      const progress = totalCapacity > 0 ? Math.round((used / totalCapacity) * 100) : 0;

                      return (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Used Amount</p>
                              <p className="text-lg font-black text-slate-900">₹{used.toLocaleString()}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{isDebit ? 'Account Balance' : 'Total Limit'}</p>
                              <p className="text-lg font-black text-blue-600">₹{(isDebit ? balance : totalCapacity).toLocaleString()}</p>
                            </div>
                          </div>

                          {/* Usage Progress Bar */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Usage Progress</p>
                              <p className="text-[10px] font-black text-slate-900">{progress}%</p>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-600 transition-all duration-1000" 
                                style={{ width: `${Math.min(100, progress)}%` }} 
                              />
                            </div>
                          </div>
                        </>
                      );
                    })()}

                    <div className="flex items-center justify-between pt-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                        {card.cardType === 'Credit' ? 'Billing cycle: 30 days' : 'Linked to your primary account'}
                      </p>
                      <button 
                        onClick={() => setSelectedCard(card)}
                        className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {cards.length === 0 && (
                <div className="lg:col-span-2 xl:col-span-3 py-32 text-center bg-white rounded-[48px] border-2 border-dashed border-slate-100">
                  <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-[32px] flex items-center justify-center mx-auto mb-8">
                    <CardIcon size={48} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4">No Active Cards Found</h3>
                  <p className="text-slate-500 font-medium mb-10 max-w-md mx-auto">You haven't applied for any credit or debit cards yet. Request one now to unlock premium benefits.</p>
                  <button 
                    onClick={() => navigate('/apply-credit-card')} 
                    className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl"
                  >
                    Request New Card
                  </button>
                </div>
              )}
            </div>

            {/* Request Status Section */}
            {serviceRequests.length > 0 && (
              <div className="space-y-8 pt-12 border-t border-slate-100">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                  <Bell className="text-blue-600" /> Recent Card Requests
                </h3>
                <div className="bg-white rounded-[40px] border border-slate-50 shadow-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-50">
                        <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Type</th>
                        <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Request Date</th>
                        <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Status</th>
                        <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Operational Detail</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {serviceRequests.map((req) => (
                        <tr key={req.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-10 py-8">
                            <p className="font-black text-slate-900">{req.type}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Ref: {req.id.slice(-8).toUpperCase()}</p>
                          </td>
                          <td className="px-10 py-8 text-sm font-medium text-slate-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                          <td className="px-10 py-8">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full border ${
                              req.status === 'P' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                              req.status === 'I' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                              req.status === 'S' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                              'bg-rose-50 text-rose-600 border-rose-100'
                            }`}>
                              {req.status === 'P' ? 'Pending (P)' : 
                               req.status === 'I' ? 'In Progress (I)' : 
                               req.status === 'S' ? 'Solved (S)' : 'Rejected (R)'}
                            </span>
                          </td>
                          <td className="px-10 py-8 text-right">
                            <div className="flex flex-col items-end gap-1">
                              <span className="font-bold text-slate-900 text-sm">
                                {req.status === 'S' ? 'Approval Granted ✅' : req.status === 'R' ? 'Request Declined ❌' : 'In Review Terminal 🔄'}
                              </span>
                              {(req.managerRemark || req.clerkRemark) && (
                                <p className="text-[10px] font-black text-rose-500 italic max-w-[200px]">
                                  "{req.managerRemark || req.clerkRemark}"
                                </p>
                              )}
                              {req.status === 'R' && req.type === 'KYC Update' && (
                                <button 
                                  onClick={() => navigate('/apply-kyc')}
                                  className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                                >
                                  Re-submit Documents
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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
              <div className="flex gap-4">
                <button 
                  onClick={downloadHistory}
                  className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all flex items-center gap-3"
                >
                  <Download size={20} /> Download Statement
                </button>
                <button onClick={() => setActiveTab('dashboard')} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all flex items-center gap-3">
                  <LayoutIcon size={20} /> Back to Overview
                </button>
              </div>
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
                            <div className="flex flex-col items-end gap-3">
                              <p className={`text-2xl font-black tracking-tighter ${!tx.isNegative ? 'text-emerald-600' : 'text-slate-900'}`}>
                                {tx.amount}
                              </p>
                              <div className="flex items-center gap-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  {tx.isNegative ? 'Debit' : 'Credit'}
                                </p>
                                <button 
                                  onClick={() => downloadReceipt({
                                    amount: tx.amountVal,
                                    fromAccount: tx.fromAccountNum,
                                    type: tx.name,
                                    remark: tx.name
                                  })}
                                  className="p-2 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-all"
                                  title="Download Receipt"
                                >
                                  <Download size={14} />
                                </button>
                              </div>
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
      case 'loans':
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">My Loan Portfolio</h2>
                <p className="text-slate-500 font-medium text-lg">Track and manage your active loans and repayments.</p>
              </div>
              <button 
                onClick={() => navigate('/apply-personal-loan')} 
                className="px-8 py-4 bg-slate-900 text-white rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl flex items-center gap-3"
              >
                <PlusCircle size={20} /> New Loan Application
              </button>
            </div>

            {loans.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {loans.map((loan, idx) => (
                  <div key={loan.id} className="group bg-white rounded-[48px] p-10 shadow-xl border border-slate-100 hover:border-blue-200 transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-blue-600/5 rounded-full blur-[80px] -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-1000"></div>
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-10">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                            <IndianRupee size={32} />
                          </div>
                          <div>
                            <h4 className="text-xl font-black text-slate-900">{loan.purpose} Loan</h4>
                            <div className="flex flex-col gap-1 mt-1">
                              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Loan ID: {loan.loanId || loan.id.substring(0, 10).toUpperCase()}</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account: {loan.accountNumber || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                        <span className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          loan.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>
                          {loan.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Loan Amount</p>
                          <p className="text-lg font-black text-slate-900">₹{parseFloat(loan.loanAmount).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly EMI</p>
                          <p className="text-lg font-black text-blue-600">₹{parseFloat(loan.emi).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tenure</p>
                          <p className="text-lg font-black text-slate-900">{loan.tenure} Months</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Interest</p>
                          <p className="text-lg font-black text-slate-900">{loan.interestRate}</p>
                        </div>
                      </div>

                      <div className="mt-10 p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                        <div className="flex justify-between items-end mb-4">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Repayment Progress</p>
                            <p className="text-sm font-bold text-slate-600">₹{parseFloat(loan.paidAmount || 0).toLocaleString()} paid of ₹{parseFloat(loan.totalPayable || 0).toLocaleString()}</p>
                          </div>
                          <p className="text-lg font-black text-slate-900">
                            {loan.totalPayable > 0 ? Math.round((loan.paidAmount / loan.totalPayable) * 100) : 0}%
                          </p>
                        </div>
                        <div className="h-3 w-full bg-white rounded-full overflow-hidden border border-slate-100">
                          <div 
                            className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                            style={{ width: `${loan.totalPayable > 0 ? Math.round((loan.paidAmount / loan.totalPayable) * 100) : 0}%` }} 
                          />
                        </div>
                      </div>

                      <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-400" />
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Started: {new Date(loan.startDate).toLocaleDateString('en-IN')}</p>
                        </div>
                        <button 
                          onClick={() => setSelectedLoan(loan)}
                          className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2"
                        >
                          View EMI Schedule <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-32 text-center bg-white rounded-[48px] border-2 border-dashed border-slate-100">
                <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-[32px] flex items-center justify-center mx-auto mb-8">
                  <Landmark size={48} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">No Active Loans Found</h3>
                <p className="text-slate-500 font-medium mb-10 max-w-md mx-auto">Apply for a personal loan today to fulfill your dreams with our low-interest plans and instant approval.</p>
                <button 
                  onClick={() => navigate('/apply-personal-loan')} 
                  className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl"
                >
                  Apply for Loan
                </button>
              </div>
            )}

            {/* Application Status Section */}
            {serviceRequests.filter(r => r.type?.toLowerCase().includes('loan')).length > 0 && (
              <div className="space-y-8 pt-12 border-t border-slate-100">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                  <Bell className="text-blue-600" /> Loan Application Status
                </h3>
                <div className="bg-white rounded-[40px] border border-slate-50 shadow-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-50">
                        <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Loan Type</th>
                        <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount Requested</th>
                        <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Status</th>
                        <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Remark / Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {serviceRequests.filter(r => r.type?.toLowerCase().includes('loan')).map((req) => (
                        <tr key={req.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-10 py-8">
                            <p className="font-black text-slate-900">{req.type}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Ref: {req.id.slice(-8).toUpperCase()}</p>
                          </td>
                          <td className="px-10 py-8 font-black text-blue-600">₹{parseFloat(req.loanAmount || req.details?.loanAmount || 0).toLocaleString()}</td>
                          <td className="px-10 py-8">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full border ${
                              req.status === 'P' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                              req.status === 'I' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                              req.status === 'S' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                              'bg-rose-50 text-rose-600 border-rose-100'
                            }`}>
                              {req.status === 'P' ? 'Pending (P)' : 
                               req.status === 'I' ? 'In Progress (I)' : 
                               req.status === 'S' ? 'Approved (S)' : 'Rejected (R)'}
                            </span>
                          </td>
                          <td className="px-10 py-8 text-right">
                            <div className="flex flex-col items-end gap-1">
                              <span className="font-bold text-slate-900 text-sm">
                                {req.status === 'S' ? 'Funds Disbursed ✅' : req.status === 'R' ? 'Application Declined ❌' : 'In Verification 🔄'}
                              </span>
                              {(req.managerRemark || req.clerkRemark) && (
                                <p className="text-[10px] font-black text-rose-500 italic max-w-[200px]">
                                  "{req.managerRemark || req.clerkRemark}"
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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
            { id: 'loans', icon: Briefcase, label: 'My Loans' },
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
          <button 
            onClick={() => openModal('change-password', 'Security Settings')} 
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-slate-400 hover:bg-blue-500/10 hover:text-blue-400 transition-all group"
          >
            <KeyRound size={22} className="group-hover:rotate-12 transition-transform" />
            <span className="font-bold tracking-tight text-sm uppercase tracking-widest">Security</span>
          </button>
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

          <div className="flex items-center gap-4 relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`w-12 h-12 bg-white border ${showNotifications ? 'border-blue-600 shadow-lg shadow-blue-100' : 'border-slate-100'} rounded-xl flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-100 hover:shadow-lg transition-all relative`}
            >
              <Bell size={20} className={showNotifications ? 'text-blue-600' : ''} />
              {(userRequests.length > 0 || serviceRequests.length > 0) && (
                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
              )}
            </button>

            <button 
              onClick={logout}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-xl text-rose-500 font-bold hover:bg-rose-50 hover:border-rose-100 transition-all shadow-sm"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline uppercase tracking-widest text-[10px]">Logout</span>
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute top-16 right-0 w-96 bg-white rounded-[32px] shadow-2xl border border-slate-100 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Recent Activity</h3>
                  <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                </div>
                <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                  {[...userRequests, ...serviceRequests]
                    .sort((a, b) => getDateObject(b.createdAt) - getDateObject(a.createdAt))
                    .slice(0, 10)
                    .map((notif) => (
                    <div key={notif.id} className="p-5 border-b border-slate-50 hover:bg-slate-50/80 transition-all group">
                      <div className="flex gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          notif.status === 'approved' || notif.status === 'S' || notif.status === 'clerk_approved' || notif.status === 'manager_approved' ? 'bg-emerald-50 text-emerald-600' :
                          notif.status === 'rejected' || notif.status === 'R' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'
                        }`}>
                          {notif.status === 'approved' || notif.status === 'S' || notif.status === 'clerk_approved' || notif.status === 'manager_approved' ? <CheckCircle2 size={18} /> :
                           notif.status === 'rejected' || notif.status === 'R' ? <X size={18} /> : <Clock size={18} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{notif.type || 'Service Request'}</p>
                            <span className="text-[10px] font-medium text-slate-400">{formatAccountDate(notif.createdAt)}</span>
                          </div>
                          <p className="text-[11px] font-bold text-slate-600 leading-relaxed">
                            {(notif.category === 'payment' || notif.category === 'transfer') && (notif.status === 'approved' || notif.status === 'S') ? `Your ${notif.category || 'payment'} for ${notif.type || 'transaction'} has been successfully processed.` :
                             (notif.status === 'approved' || notif.status === 'S') ? `Your ${notif.type || 'request'} has been fully approved.` :
                             notif.status === 'clerk_approved' ? 'Approved by Clerk, awaiting Manager review.' :
                             notif.status === 'manager_approved' ? 'Final approval granted by Manager.' :
                             notif.status === 'rejected' || notif.status === 'R' ? `Your ${notif.type || 'request'} was declined.` :
                             (notif.category === 'payment' || notif.category === 'transfer') ? 'Your transaction is being processed.' : 'Your request is currently under review.'}
                          </p>
                          {(notif.clerkRemark || notif.managerRemark) && (
                            <p className="mt-2 text-[10px] font-black text-rose-500 italic bg-rose-50/50 p-2 rounded-lg border-l-2 border-rose-500">
                              Note: {notif.managerRemark || notif.clerkRemark}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {[...userRequests, ...serviceRequests].length === 0 && (
                    <div className="p-10 text-center">
                      <Bell size={32} className="text-slate-200 mx-auto mb-3" />
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No new notifications</p>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                  <button onClick={() => setShowNotifications(false)} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Mark all as read</button>
                </div>
              </div>
            )}

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

          {/* Change Password Logic */}
          {modal.type === 'change-password' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
                <div className="space-y-2">
                  <label className="label">Current Security Key</label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={passwordFormData.currentPassword} 
                    onChange={(e) => setPasswordFormData({...passwordFormData, currentPassword: e.target.value})} 
                    required 
                    className="h-14 rounded-2xl"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="label">New Security Key</label>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      value={passwordFormData.newPassword} 
                      onChange={(e) => setPasswordFormData({...passwordFormData, newPassword: e.target.value})} 
                      required 
                      className="h-14 rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="label">Confirm New Key</label>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      value={passwordFormData.confirmPassword} 
                      onChange={(e) => setPasswordFormData({...passwordFormData, confirmPassword: e.target.value})} 
                      required 
                      className="h-14 rounded-2xl"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
                <ShieldCheck className="text-blue-600" size={20} />
                <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest">
                  Updating your key will re-authenticate your secure session.
                </p>
              </div>

              <button 
                type="submit" 
                disabled={isChangingPassword} 
                className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3"
              >
                {isChangingPassword ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Update Security Key <KeyRound size={20} /></>
                )}
              </button>
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
                        <option value="saving">Saving Account (3% p.a. Interest)</option>
                        <option value="current">Current Account (No Interest)</option>
                        <option value="fd">Fixed Deposit (6% p.a. Interest)</option>
                        <option value="joint">Joint Account (3% p.a. Interest)</option>
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
                          {allAccounts
                            .filter(acc => acc.accountType?.toLowerCase() !== 'fd')
                            .map(acc => (
                              <option key={acc.id} value={acc.accountNumber}>
                                {acc.accountType.toUpperCase()} - {acc.accountNumber} (₹{acc.balance})
                              </option>
                            ))
                          }
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
                              .filter(acc => acc.accountNumber !== formData.fromAccount && acc.accountType?.toLowerCase() !== 'fd')
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
                            placeholder="Enter recipient full name" 
                            onChange={handleInputChange} 
                            value={formData.recipientName || ''}
                            required 
                          />
                          <Input 
                            label="Recipient Account Number" 
                            name="recipient" 
                            placeholder="SB-XXXXXXXXXXXX" 
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
                    {isPaymentOtpSent ? (
                      <PaymentOtpVerification 
                        onVerify={() => {
                          const fakeEvent = { preventDefault: () => {} };
                          handleSubmit(fakeEvent);
                        }} 
                        onCancel={() => setIsPaymentOtpSent(false)} 
                        paymentOtp={paymentOtp}
                        paymentOtpInput={paymentOtpInput}
                        setPaymentOtpInput={setPaymentOtpInput}
                        setFormError={setFormError}
                      />
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {/* USE CASE: Pay bills / Recharge */}
              {modal.type === 'bill-pay' && (
                <div className="space-y-6">
                  {/* Common: Payment Source & Category Selection */}
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="label">Payment Source</label>
                        <select 
                          name="paymentSourceType" 
                          onChange={(e) => {
                            handleInputChange(e);
                            setFormData(prev => ({ ...prev, fromAccount: '', fromCard: '' }));
                          }} 
                          value={formData.paymentSourceType || 'account'}
                          className="input" 
                          required
                        >
                          <option value="account">Bank Account</option>
                          <option value="card">Debit/Credit Card</option>
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

                    <div className="grid grid-cols-1 gap-6">
                      {formData.paymentSourceType === 'card' ? (
                        <div className="space-y-2">
                          <label className="label">Select Card</label>
                          <select 
                            name="fromCard" 
                            onChange={(e) => {
                              const selectedCard = cards.find(c => c.cardNumber === e.target.value);
                              setFormData(prev => ({ 
                                ...prev, 
                                fromCard: e.target.value,
                                fromAccount: selectedCard?.accountNumber || '' // For debit cards, linked account
                              }));
                            }} 
                            value={formData.fromCard || ''}
                            className="input" 
                            required
                          >
                            <option value="">Select payment card</option>
                            {cards.filter(c => c.status === 'Active').map(card => (
                              <option key={card.id} value={card.cardNumber}>
                                {card.cardType.toUpperCase()} - {card.cardNumber} ({card.userName})
                              </option>
                            ))}
                          </select>
                          {cards.filter(c => c.status === 'Active').length === 0 && (
                            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest px-2 italic">No active cards found. Please apply for a card first.</p>
                          )}
                        </div>
                      ) : (
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
                          {allAccounts
                            .filter(acc => acc.accountType?.toLowerCase() !== 'fd')
                            .map(acc => (
                              <option key={acc.id} value={acc.accountNumber}>
                                {acc.accountType.toUpperCase()} - {acc.accountNumber} (₹{acc.balance})
                              </option>
                            ))
                          }
                        </select>
                      </div>
                      )}
                    </div>

                    {/* Default Form for other categories */}
                    {formData.billCategory && !['electricity', 'mobile-recharge', 'credit-card', 'loan-emi'].includes(formData.billCategory) && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Input label="Reference Number" name="refNum" placeholder="Consumer ID / Card Num / Mobile" onChange={handleInputChange} required />
                          <Input label="Amount (₹)" name="amount" type="number" placeholder="0.00" onChange={handleInputChange} required />
                        </div>
                        <div className="pt-4">
                          {isPaymentOtpSent ? (
                            <PaymentOtpVerification 
                              onVerify={() => {
                                const fakeEvent = { preventDefault: () => {} };
                                handleSubmit(fakeEvent);
                              }} 
                              onCancel={() => setIsPaymentOtpSent(false)} 
                              paymentOtp={paymentOtp}
                              paymentOtpInput={paymentOtpInput}
                              setPaymentOtpInput={setPaymentOtpInput}
                              setFormError={setFormError}
                            />
                          ) : (
                            <button 
                              type="submit" 
                              disabled={submitting}
                              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 uppercase tracking-widest text-xs"
                            >
                              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Submit Payment <ArrowRight size={18} /></>}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SPECIAL FLOW: Loan EMI Payment */}
                  {formData.billCategory === 'loan-emi' && (() => {
                    const emiAmount = fetchedLoan?.emi || 0;
                    const penalty = 0; // Mock penalty for simplicity, could be added to schema later
                    const totalPayable = emiAmount + penalty;
                    const isAmountBelowEmi = fetchedLoan && parseFloat(formData.amount || 0) < emiAmount;
                    
                    const sourceAccount = allAccounts.find(acc => acc.accountNumber === formData.fromAccount);
                    const isBalanceInsufficient = sourceAccount && sourceAccount.balance < parseFloat(formData.amount || 0);

                    const handlePayment = async () => {
                      if (!formData.fromAccount && !formData.fromCard) {
                        setFormError('Please select a source account or card to pay from.');
                        return;
                      }
                      if (isAmountBelowEmi) {
                        setFormError(`EMI payment must be at least ₹${emiAmount.toLocaleString()}.`);
                        return;
                      }
                      
                      setFormError('');
                      handleSendPaymentOTP();
                    };

                    const executeLoanPayment = async () => {
                      setSubmitting(true);
                      try {
                        const result = await payLoanEMI(formData.refNum, parseFloat(formData.amount), formData.fromAccount, formData.fromCard);
                        if (result.success) {
                          setLoanStatus('success');
                          setLoanStep(2);
                        } else {
                          setFormError(result.message || 'Payment failed.');
                        }
                      } catch (err) {
                        setFormError('An unexpected error occurred during payment.');
                      } finally {
                        setSubmitting(false);
                      }
                    };

                    return (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        {loanStep === 1 && (
                          <>
                            {isPaymentOtpSent ? (
                              <PaymentOtpVerification 
                                onVerify={executeLoanPayment} 
                                onCancel={() => setIsPaymentOtpSent(false)} 
                                paymentOtp={paymentOtp}
                                paymentOtpInput={paymentOtpInput}
                                setPaymentOtpInput={setPaymentOtpInput}
                                setFormError={setFormError}
                              />
                            ) : (
                              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                                  <div className="flex gap-4 items-end">
                                    <div className="flex-1">
                                      <Input 
                                        label="Loan ID / Reference ID" 
                                        name="refNum" 
                                        placeholder="Enter Loan ID (e.g. L-XXXXXXXXX)" 
                                        onChange={handleInputChange} 
                                        value={formData.refNum || ''} 
                                        required 
                                      />
                                    </div>
                                    <button 
                                      type="button"
                                      onClick={() => handleFetchLoan()}
                                      disabled={checkingBill || !formData.refNum}
                                      className="h-14 px-6 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50 text-xs uppercase tracking-widest whitespace-nowrap"
                                    >
                                      {checkingBill ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Fetch Details'}
                                    </button>
                                  </div>

                                  {fetchedLoan && (
                                    <div className="animate-in fade-in slide-in-from-top-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <Input 
                                        label="Loan Holder Name" 
                                        name="cardHolder" 
                                        value={fetchedLoan.userName || ''} 
                                        readOnly
                                        required 
                                      />
                                      <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Loan Status</p>
                                        <span className={`px-3 py-1 ${fetchedLoan.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'} text-[10px] font-black rounded-full uppercase tracking-tighter`}>
                                          {fetchedLoan.status}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {fetchedLoan && (
                                  <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
                                    {/* Loan Overview Cards */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                      <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
                                        <p className="text-xs font-black text-slate-900">₹{fetchedLoan.loanAmount?.toLocaleString()}</p>
                                      </div>
                                      <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Interest Rate</p>
                                        <p className="text-xs font-black text-slate-900">{fetchedLoan.interestRate}</p>
                                      </div>
                                      <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Remaining</p>
                                        <p className="text-xs font-black text-blue-600">₹{fetchedLoan.remainingBalance?.toLocaleString()}</p>
                                      </div>
                                      <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Paid Amount</p>
                                        <p className="text-xs font-black text-emerald-600">₹{(fetchedLoan.paidAmount || 0).toLocaleString()}</p>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly EMI</p>
                                        <p className="text-sm font-black text-slate-900">₹{emiAmount.toLocaleString()}</p>
                                      </div>
                                      <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Next Due Date</p>
                                        <p className="text-sm font-black text-blue-600">
                                          {(() => {
                                            const nextEmi = fetchedLoan.emiSchedule?.find(item => item.status === 'Pending');
                                            return nextEmi ? new Date(nextEmi.dueDate).toLocaleDateString() : 'Paid Off';
                                          })()}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="p-6 bg-blue-600 rounded-[32px] border border-blue-500 shadow-xl shadow-blue-100 flex items-center justify-between text-white">
                                      <div>
                                        <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-1">Payable EMI</p>
                                        <p className="text-3xl font-black">₹{totalPayable.toLocaleString()}</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-1">Verification</p>
                                        <span className="px-3 py-1 bg-white/20 text-white text-[10px] font-black rounded-full uppercase tracking-tighter border border-white/30 backdrop-blur-sm">Verified Loan</span>
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <label className="label">Payment Amount (₹)</label>
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
                                    onClick={handlePayment}
                                    disabled={submitting || !fetchedLoan || isAmountBelowEmi}
                                    className="w-2/3 h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-xs disabled:opacity-50"
                                  >
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Confirm Payment <ArrowRight size={18} /></>}
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {loanStep === 2 && (
                          <div className="p-10 bg-white rounded-[40px] border border-slate-100 shadow-2xl space-y-10 animate-in zoom-in-95 text-center">
                            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-2 animate-in bounce-in duration-700">
                              <CheckCircle2 size={56} />
                            </div>
                            <div className="space-y-3">
                              <h4 className="text-3xl font-black text-slate-900 tracking-tight">EMI Payment Successfully!</h4>
                              <p className="text-slate-500 font-medium text-lg">Your payment of ₹{parseFloat(formData.amount).toLocaleString()} was processed securely.</p>
                            </div>
                            <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 text-left space-y-4">
                              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Loan Reference</span>
                                <span className="font-bold text-slate-900">{formData.refNum}</span>
                              </div>
                              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Paid From Account</span>
                                <span className="font-mono font-bold text-slate-900">{formData.fromAccount}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Transaction ID</span>
                                <span className="font-mono font-bold text-slate-900">EMI-TX-{Math.floor(Math.random() * 90000000 + 10000000)}</span>
                              </div>
                            </div>
                            <button 
                              type="button" 
                              onClick={closeModal}
                              className="w-full h-16 bg-slate-900 text-white font-black rounded-2xl shadow-xl transition-all uppercase tracking-widest text-sm"
                            >
                              Return to Dashboard
                            </button>
                          </div>
                        )}
                      </div>
                    );})()}

                  {/* SPECIAL FLOW: Credit Card Bill Payment */}
                  {formData.billCategory === 'credit-card' && (() => {
                    const showCcAmountFields = fetchedCard && formData.refNum?.replace(/\s/g, '').length === 16;
                    const isCustomAmount = formData.ccAmountOption === 'custom';
                    
                    // Real data from fetchedCard
                    const outstanding = fetchedCard ? (fetchedCard.limit * 0.25) : 0; // Assuming 25% of limit is due
                    const minDue = outstanding * 0.05; // 5% of outstanding
                    const totalDue = outstanding;
                    const dueDate = fetchedCard ? "15-Apr-2026" : "N/A"; // Mock due date for now
                    
                    const isAmountBelowMin = isCustomAmount && parseFloat(formData.amount || 0) < minDue;
                    
                    const handleCCPayment = async () => {
                      if (!formData.fromAccount) {
                        setFormError('Please select a source account to pay from.');
                        return;
                      }
                      const sourceAccount = allAccounts.find(acc => acc.accountNumber === formData.fromAccount);
                      if (!sourceAccount || sourceAccount.balance < parseFloat(formData.amount || 0)) {
                        setFormError(`Insufficient balance in account ${formData.fromAccount}. Available: ₹${(sourceAccount?.balance || 0).toLocaleString()}`);
                        return;
                      }
                      if (formData.refNum?.replace(/\s/g, '').length !== 16) {
                        setFormError('Credit card number must be 16 digits.');
                        return;
                      }
                      if (!formData.amount) {
                        setFormError('Please enter a payment amount.');
                        return;
                      }
                      if (isAmountBelowMin) {
                        setFormError(`Custom payment must be at least ₹${minDue.toLocaleString()}.`);
                        return;
                      }
                      
                      setFormError('');
                      handleSendPaymentOTP();
                    };

                    const executeCCPayment = async () => {
                      setSubmitting(true);
                      
                      // Process payment via the performPayment helper
                      const processCCPayment = async () => {
                        try {
                          const result = await performPayment({
                            fromAccountNumber: formData.fromAccount,
                            amount: parseFloat(formData.amount),
                            type: 'Credit Card Payment',
                            remark: `Credit Card Bill: ${formData.refNum}`,
                            billCategory: 'credit-card'
                          });

                          if (!result.success) throw new Error(result.message);

                          setCcPaymentStatus('success');
                          setCcStep(2);

                          // Add request to history
                          const userName = `${userProfile?.firstName || 'User'} ${userProfile?.lastName || ''}`.trim();
                          await addRequest({
                            userId: userProfile?.uid,
                            userName,
                            type: 'Credit Card Bill Payment',
                            category: 'payment',
                            details: {
                              ...formData,
                              bankName: 'SmartBank',
                              billCategory: 'credit-card',
                              cardType: fetchedCard.cardType
                            },
                            status: 'approved'
                          });
                        } catch (err) {
                          setFormError(err.message);
                        } finally {
                          setSubmitting(false);
                        }
                      };

                      setTimeout(processCCPayment, 1500);
                    };

                    return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                      {/* Step 1: CC Details Form */}
                      {ccStep === 1 && (
                        <>
                          {isPaymentOtpSent ? (
                            <PaymentOtpVerification 
                              onVerify={executeCCPayment} 
                              onCancel={() => setIsPaymentOtpSent(false)} 
                              paymentOtp={paymentOtp}
                              paymentOtpInput={paymentOtpInput}
                              setPaymentOtpInput={setPaymentOtpInput}
                              setFormError={setFormError}
                            />
                          ) : (
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex gap-4 items-end">
                                  <div className="flex-1">
                                    <Input 
                                      label="Credit Card Number" 
                                      name="refNum" 
                                      maxLength="19"
                                      placeholder="XXXX XXXX XXXX XXXX" 
                                      onChange={handleInputChange} 
                                      value={formData.refNum || ''} 
                                      required 
                                    />
                                  </div>
                                  <button 
                                    type="button"
                                    onClick={() => handleFetchCard(formData.refNum)}
                                    disabled={checkingBill || !formData.refNum || formData.refNum.replace(/\s/g, '').length !== 16}
                                    className="h-14 px-6 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50 text-xs uppercase tracking-widest whitespace-nowrap"
                                  >
                                    {checkingBill ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
                                  </button>
                                </div>
                                <Input 
                                  label="Card Holder Name" 
                                  name="cardHolder" 
                                  placeholder="Fetching holder name..." 
                                  value={fetchedCard?.userName || ''} 
                                  readOnly
                                  required 
                                />
                              </div>

                              {showCcAmountFields && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
                                  <div className="space-y-2">
                                    <label className="label">Bank Name</label>
                                    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                                      <Landmark className="w-4 h-4 text-blue-600" />
                                      <span className="text-sm font-black text-slate-900">SmartBank (Internal)</span>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
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
                                          Min ₹{minDue.toLocaleString()} required
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {showCcAmountFields && (
                                <>
                                  {/* Extra Features: Outstanding & Due Date */}
                                  <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Outstanding</p>
                                      <p className="text-sm font-black text-slate-900">₹{outstanding.toLocaleString()}</p>
                                    </div>
                                    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Due Date</p>
                                      <p className="text-sm font-black text-rose-500">{dueDate}</p>
                                    </div>
                                  </div>

                                  {/* Amount Options (Radio Buttons) */}
                                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Payment Option</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                      {[
                                        { id: 'total', label: 'Total Amount', value: totalDue },
                                        { id: 'min', label: 'Minimum Due', value: minDue },
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
                                            {option.value !== '' && <span className="text-xs font-bold text-blue-600">₹{option.value.toLocaleString()}</span>}
                                          </div>
                                          <input 
                                            type="radio" 
                                            name="ccAmountOption" 
                                            value={option.id} 
                                            checked={formData.ccAmountOption === option.id}
                                            onChange={(e) => {
                                              const { value } = e.target;
                                              setFormData(prev => ({
                                                ...prev,
                                                ccAmountOption: value,
                                                amount: value === 'total' ? totalDue : (value === 'min' ? minDue : '')
                                              }));
                                            }}
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
                                  onClick={handleCCPayment}
                                  disabled={submitting || !showCcAmountFields || isAmountBelowMin || !formData.fromAccount}
                                  className="w-2/3 h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-xs disabled:opacity-50"
                                >
                                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Pay Now <ArrowRight size={18} /></>}
                                </button>
                              </div>
                            </div>
                          )}
                        </>
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
                                  <span className="font-bold text-slate-900">SmartBank</span>
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
                                Return to Dashboard
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
                                {isPaymentOtpSent ? (
                                  <PaymentOtpVerification 
                                    onVerify={() => {
                                      // Manually trigger the form submit logic
                                      const fakeEvent = { preventDefault: () => {} };
                                      handleSubmit(fakeEvent);
                                    }} 
                                    onCancel={() => setIsPaymentOtpSent(false)} 
                                    paymentOtp={paymentOtp}
                                    paymentOtpInput={paymentOtpInput}
                                    setPaymentOtpInput={setPaymentOtpInput}
                                    setFormError={setFormError}
                                  />
                                ) : (
                                  <>
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
                                  </>
                                )}
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
                            {isPaymentOtpSent ? (
                              <PaymentOtpVerification 
                                onVerify={() => {
                                  const fakeEvent = { preventDefault: () => {} };
                                  handleSubmit(fakeEvent);
                                }} 
                                onCancel={() => setIsPaymentOtpSent(false)} 
                                paymentOtp={paymentOtp}
                                paymentOtpInput={paymentOtpInput}
                                setPaymentOtpInput={setPaymentOtpInput}
                                setFormError={setFormError}
                              />
                            ) : (
                              <>
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
                              </>
                            )}
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
                        <>{(formData.serviceType === 'credit-card' || formData.serviceType === 'debit-card' || formData.serviceType === 'loan' || formData.serviceType === 'kyc') ? 'Apply Now' : `Submit ${modal.title} Request`} <ArrowRight size={22} /></>
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

      {/* Loan Details Modal */}
      <Modal 
        isOpen={!!selectedLoan} 
        onClose={() => setSelectedLoan(null)} 
        title={`${selectedLoan?.purpose} Loan Details`}
      >
        {selectedLoan && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Remaining Balance</p>
                <p className="text-xl font-black text-slate-900">₹{parseFloat(selectedLoan.remainingBalance || 0).toLocaleString()}</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Paid</p>
                <p className="text-xl font-black text-emerald-600">₹{parseFloat(selectedLoan.paidAmount || 0).toLocaleString()}</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly EMI</p>
                <p className="text-xl font-black text-blue-600">₹{parseFloat(selectedLoan.emi || 0).toLocaleString()}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 px-2">EMI Repayment Schedule</h4>
              <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Month</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {selectedLoan.emiSchedule?.map((emi) => (
                      <tr key={emi.month} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">Month {emi.month}</td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-500">{new Date(emi.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td className="px-6 py-4 font-black text-slate-900">₹{parseFloat(emi.amount).toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                            emi.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                            {emi.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="pt-4">
              <Button onClick={() => setSelectedLoan(null)} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest">Close Details</Button>
            </div>
          </div>
        )}
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
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Available Balance</p>
                    {(selectedAccount.accountType?.toLowerCase() === 'saving' || selectedAccount.accountType?.toLowerCase() === 'fd') && (
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-emerald-100">
                        {selectedAccount.accountType?.toLowerCase() === 'fd' ? '6% p.a. Interest' : '3% p.a. Interest'}
                      </span>
                    )}
                  </div>
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
                  <p className="font-bold text-slate-700">
                    {selectedAccount.nomineeName || selectedAccount.details?.nomineeName || userProfile?.nomineeName || 'Not Specified'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Relationship</p>
                  <p className="font-bold text-slate-700">
                    {selectedAccount.nomineeRelation || selectedAccount.details?.nomineeRelation || userProfile?.nomineeRelation || 'Not Specified'}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions: View Debit Card & Add Money */}
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
              <button 
                onClick={() => downloadAccountStatement(selectedAccount)}
                className="flex-1 h-16 rounded-2xl bg-emerald-600 text-white font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all shadow-xl flex items-center justify-center gap-3"
              >
                <Download size={20} /> Download Statement
              </button>
              <button 
                onClick={() => setDepositModal(true)}
                className="flex-1 h-16 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-slate-900 transition-all shadow-xl flex items-center justify-center gap-3"
              >
                <PlusCircle size={20} /> Add Money
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

      {/* Card Details Modal */}
      <Modal
        isOpen={!!selectedCard && !isPayingCardBill}
        onClose={() => setSelectedCard(null)}
        title="Card Detailed Specification"
        size="lg"
      >
        {selectedCard && (
          <div className="space-y-8">
            {/* Header: Name & Type */}
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[32px] border border-slate-100">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-200">
                  {selectedCard.cardType === 'Credit' ? '💳' : '🏦'}
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Card Holder</p>
                  <h3 className="text-xl font-black text-slate-900">{selectedCard.userName}</h3>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Card Protocol</p>
                <span className={`px-4 py-1.5 ${selectedCard.cardType === 'Credit' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'} rounded-full text-[10px] font-black uppercase tracking-widest border`}>
                  {selectedCard.cardType} {selectedCard.category}
                </span>
              </div>
            </div>

            {/* Core Stats: Number & Usage/Account */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-slate-900 rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 bg-blue-600/20 rounded-full blur-2xl -mr-5 -mt-5 group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-4">Card Number</p>
                  <p className="text-2xl font-mono tracking-[0.2em] font-bold">
                    {selectedCard.cardNumber}
                  </p>
                  <div className="mt-6 flex gap-8">
                    <div>
                      <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Expiry</p>
                      <p className="text-sm font-bold">{selectedCard.expiry}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">CVV</p>
                      <p className="text-sm font-bold">***</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedCard.cardType === 'Debit' ? (
                // Debit Card: Show Linked Account Info & Usage
                <div className="p-8 bg-white border border-slate-100 rounded-[32px] shadow-xl flex flex-col justify-between gap-6">
                  {(() => {
                    const linkedAcc = allAccounts.find(acc => acc.accountNumber === selectedCard.accountNumber);
                    return (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bill Payment Usage</p>
                            <h4 className="text-xl font-black text-slate-900 tracking-tight">₹{parseFloat(selectedCard.usedLimit || 0).toLocaleString()}</h4>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Available Balance</p>
                            <h4 className="text-xl font-black text-blue-600 tracking-tight">₹{(linkedAcc?.balance || 0).toLocaleString()}</h4>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Linked Bank Account</p>
                          <p className="text-sm font-black text-slate-900">{selectedCard.accountNumber}</p>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-500 font-bold text-[10px]">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Live Account Link Active
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                // Credit Card: Show Usage Tracker
                <div className="p-8 bg-white border border-slate-100 rounded-[32px] shadow-xl flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Card Usage</p>
                    <h4 className="text-4xl font-black text-slate-900 tracking-tight">₹{parseFloat(selectedCard.usedLimit || 0).toLocaleString()}</h4>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-blue-500 font-bold text-xs">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    Real-time Usage Tracker
                  </div>
                </div>
              )}
            </div>

            {/* Terms & Billing Info (Only for Credit Cards) or Account Details (For Debit Cards) */}
            {selectedCard.cardType === 'Credit' ? (
              <div className="p-8 bg-amber-50 rounded-[32px] border border-amber-100 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-amber-900 uppercase tracking-widest">Billing Terms & Conditions</h4>
                    <p className="text-[10px] text-amber-700 font-bold uppercase tracking-tight mt-0.5">Please review the card usage policies carefully</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-amber-200/50">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5" />
                      <p className="text-xs font-medium text-amber-900">
                        <span className="font-black uppercase tracking-tighter">Billing Cycle:</span> You must pay your card bill within <span className="font-black">30 days</span> of statement generation.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5" />
                      <p className="text-xs font-medium text-amber-900">
                        <span className="font-black uppercase tracking-tighter">Interest Rate:</span> Failure to pay the total due within the cycle will attract <span className="font-black text-rose-600">30% - 40% annual interest</span>.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5" />
                      <p className="text-xs font-medium text-amber-900">
                        <span className="font-black uppercase tracking-tighter">Due Period:</span> Standard bill payment due date is <span className="font-black">15 days</span> from statement date.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5" />
                      <p className="text-xs font-medium text-amber-900">
                        <span className="font-black uppercase tracking-tighter">Late Charges:</span> A late payment fee of <span className="font-black text-rose-600">₹500+</span> applies if the minimum amount is not paid by the due date.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-blue-50 rounded-[32px] border border-blue-100 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                    <CardIcon size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-blue-900 uppercase tracking-widest">Debit Card Policy</h4>
                    <p className="text-[10px] text-blue-700 font-bold uppercase tracking-tight mt-0.5">Linked to your high-security bank account</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-blue-200/50">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5" />
                      <p className="text-xs font-medium text-blue-900">
                        <span className="font-black uppercase tracking-tighter">Direct Debit:</span> All transactions are immediately debited from account <span className="font-black">{selectedCard.accountNumber}</span>.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5" />
                      <p className="text-xs font-medium text-blue-900">
                        <span className="font-black uppercase tracking-tighter">Security:</span> Real-time verification for every transaction through our secure gateway.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  if (selectedCard.cardType === 'Credit') {
                    setIsPayingCardBill(true);
                    setFormData({
                      fromAccount: '',
                      amount: parseFloat(selectedCard.usedLimit || 0),
                      cardNumber: selectedCard.cardNumber,
                      cardId: selectedCard.id
                    });
                  } else {
                    setSelectedCard(null);
                    setActiveTab('payments');
                    setFormData(prev => ({ 
                      ...prev, 
                      paymentSourceType: 'card',
                      fromCard: selectedCard.cardNumber,
                      billCategory: ''
                    }));
                  }
                }}
                className="flex-1 h-16 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-slate-900 transition-all shadow-xl flex items-center justify-center gap-3"
              >
                <IndianRupee size={20} /> {selectedCard.cardType === 'Credit' ? 'Pay Card Bill' : 'Pay Using Card'}
              </button>
              <Button onClick={() => setSelectedCard(null)} className="flex-1 h-16 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-xs">
                Close Details
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Credit Card Bill Payment Modal */}
      <Modal
        isOpen={isPayingCardBill}
        onClose={() => { 
          setIsPayingCardBill(false); 
          setFormData({}); 
          setFormError(''); 
          setPaymentOtp('');
          setIsPaymentOtpSent(false);
          setPaymentOtpInput('');
        }}
        title="Pay Credit Card Bill"
        size="md"
      >
        {selectedCard && (
          <div className="space-y-6">
            {isPaymentOtpSent ? (
              <PaymentOtpVerification 
                onVerify={async () => {
                  setSubmitting(true);
                  try {
                    const res = await payCardBill({
                      cardId: selectedCard.id,
                      accountNumber: formData.fromAccount,
                      amount: parseFloat(formData.amount),
                      cardNumber: selectedCard.cardNumber
                    });
                    if (res.success) {
                      showToast(`₹${formData.amount} paid successfully! Card usage updated. ✅`);
                      setIsPayingCardBill(false);
                      setSelectedCard(null);
                      setPaymentOtp('');
                      setIsPaymentOtpSent(false);
                      setPaymentOtpInput('');
                    } else {
                      setFormError(res.message);
                    }
                  } catch (err) {
                    setFormError(`Transaction Error: ${err.message || 'Payment failed. Please try again.'}`);
                  } finally {
                    setSubmitting(false);
                  }
                }} 
                onCancel={() => setIsPaymentOtpSent(false)} 
                paymentOtp={paymentOtp}
                paymentOtpInput={paymentOtpInput}
                setPaymentOtpInput={setPaymentOtpInput}
                setFormError={setFormError}
              />
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!formData.fromAccount) {
                  setFormError('Please select a source account.');
                  return;
                }
                const sourceAccount = allAccounts.find(acc => acc.accountNumber === formData.fromAccount);
                if (!sourceAccount || sourceAccount.balance < parseFloat(formData.amount)) {
                  setFormError('Insufficient balance in selected account.');
                  return;
                }
                setFormError('');
                handleSendPaymentOTP();
              }} className="space-y-6">
                <div className="p-6 bg-slate-900 rounded-[32px] text-white space-y-4">
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <div>
                      <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">Credit Card</p>
                      <p className="text-sm font-mono tracking-wider">{selectedCard.cardNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">Total Bill Due</p>
                      <p className="text-xl font-black text-white">₹{parseFloat(selectedCard.usedLimit || 0).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-white/40">
                    <Calendar size={12} /> Statement Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Payment Amount (₹)</label>
                    <Input
                      type="number"
                      value={formData.amount}
                      readOnly
                      className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-black text-slate-900"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Pay From Account</label>
                    <select 
                      name="fromAccount" 
                      onChange={handleInputChange} 
                      value={formData.fromAccount || ''}
                      className="input h-14" 
                      required
                    >
                      <option value="">Select source account</option>
                      {allAccounts
                        .filter(acc => acc.accountType?.toLowerCase() !== 'fd')
                        .map(acc => (
                          <option key={acc.id} value={acc.accountNumber}>
                            {acc.accountType.toUpperCase()} - {acc.accountNumber} (₹{acc.balance.toLocaleString()})
                          </option>
                        ))
                      }
                    </select>
                  </div>
                </div>

                {formError && (
                  <div className="p-4 bg-rose-50 text-rose-500 rounded-2xl text-xs font-bold border border-rose-100 animate-pulse">
                    {formError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || parseFloat(selectedCard.usedLimit || 0) <= 0}
                  className="w-full h-16 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest shadow-xl shadow-blue-200 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Confirm & Pay Bill <IndianRupee size={20} /></>}
                </button>
              </form>
            )}
          </div>
        )}
      </Modal>

      {/* Deposit Request Modal */}
      <Modal
        isOpen={depositModal}
        onClose={() => { setDepositModal(false); setDepositAmount(''); setFormError(''); }}
        title="Deposit Money to Account"
        size="md"
      >
        {selectedAccount && (
          <form onSubmit={handleDepositRequest} className="space-y-6">
            <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 mb-6">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Target Account</p>
              <h4 className="text-lg font-black text-slate-900">{selectedAccount.accountNumber}</h4>
              <p className="text-xs text-slate-500 font-medium">{(selectedAccount.accountType || 'Saving').toUpperCase()} Account</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Amount to Deposit (₹)</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="h-14 rounded-2xl"
                required
              />
              <p className="text-[10px] text-slate-400 font-medium px-1 italic">
                * This deposit request will be sent to the bank clerk for approval.
              </p>
            </div>

            {formError && (
              <div className="p-4 bg-rose-50 text-rose-500 rounded-2xl text-xs font-bold border border-rose-100 animate-pulse">
                {formError}
              </div>
            )}

            <Button
              type="submit"
              disabled={isDepositing}
              className="w-full h-16 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest shadow-xl shadow-blue-200"
            >
              {isDepositing ? 'Submitting...' : 'Submit Deposit Request'}
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
