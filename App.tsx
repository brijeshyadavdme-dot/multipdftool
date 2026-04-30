/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Menu, X, ChevronLeft, Plus, Trash2, Edit3, Pencil, Save, 
  CircleCheck, TrendingUp, Settings, FileText, 
  Wallet, Fuel, Milk, ShoppingCart, ArrowLeftRight,
  Download, Languages, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';

// --- Types ---
type View = 'dashboard' | 'milk' | 'fuel' | 'veg' | 'loan' | 'other' | 'reports' | 'settings' | 'gas' | 'school' | 'pets';
type Language = 'hi' | 'en';

interface MilkSupplier {
  id: number;
  name: string;
  advance: number;
}

interface MilkEntry {
  id: number;
  date: string;
  supplierId: number;
  supplierName: string;
  liters: number;
  rate: number;
  cost: number;
  time: 'morning' | 'evening';
}

interface GasEntry {
  id: number;
  date: string;
  agency: string;
  amount: number;
  note: string;
}

interface SchoolEntry {
  id: number;
  date: string;
  studentName: string;
  studentClass: string;
  amount: number;
  note: string;
}

interface PetEntry {
  id: number;
  date: string;
  petName: string;
  type: string; // Vaccine, Food, etc.
  amount: number;
  note: string;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface FuelEntry {
  id: number;
  date: string;
  location: string;
  liters?: number;
  rate?: number;
  cost: number;
  method: 'liter' | 'money';
  note: string;
}

interface VegEntry {
  id: number;
  date: string;
  shopName: string;
  amount: number;
  note: string;
}

interface LoanEntry {
  id: number;
  date: string;
  type: 'given' | 'taken';
  person: string;
  amount: number;
  note: string;
  settled: boolean;
  dueDate?: string;
}

interface OtherEntry {
  id: number;
  date: string;
  category: string;
  amount: number;
  note: string;
}

// --- Translations ---
const TRANSLATIONS = {
  hi: {
    splashTitle: 'Expense Tracker',
    splashSubtitle: 'खर्चा ट्रैकर',
    pageTitle: 'होम',
    menuTitle: 'मेन्यू',
    menuSubtitle: 'चुनें क्या करना है',
    menuMilk: 'दूध का हिसाब',
    menuFuel: 'फ्यूल ट्रैकर',
    menuVeg: 'सब्जी का हिसाब',
    menuLoan: 'उधार (लोन)',
    menuOther: 'अन्य खर्चे',
    menuGas: 'गैस रिफिल',
    menuSchool: 'बच्चों की फीस',
    menuPets: 'पेट केयर',
    menuReports: 'रिपोर्ट देखें',
    menuSettings: 'सेटिंग्स',
    categoryTitle: 'खर्चा ब्रेकडाउन',
    recentTitle: 'हाल की एंट्री',
    todayExpense: 'आज का खर्चा',
    thisMonth: 'इस महीने',
    noEntries: 'कोई एंट्री नहीं',
    milk: 'दूध',
    fuel: 'फ्यूल',
    veg: 'सब्जी',
    gas: 'गैस',
    school: 'स्कूल फीस',
    pets: 'पेट्स',
    loanGiven: 'उधार दिया',
    loanTaken: 'उधार लिया',
    other: 'अन्य',
    milkCardTitle: 'दूध एंट्री',
    milkDateLabel: 'तारीख (एक दिन)',
    milkSupplierLabel: 'सप्लायर चुनें',
    milkLitersLabel: 'लीटर',
    milkRateLabel: 'रेट/लीटर (₹)',
    milkSaveBtn: 'सेव करें',
    milkHistoryTitle: 'दूध का हिसाब',
    morning: 'सुबह',
    evening: 'शाम',
    bothTimes: 'दोनों समय',
    supplierSummaryTitle: 'सप्लायर वाइज हिसाब',
    totalMilk: 'कुल दूध',
    totalCost: 'कुल खर्चा',
    totalAdvance: 'कुल एडवांस',
    pending: 'बकाया',
    advanceLabel: 'एडवांस जमा करें',
    gasCardTitle: 'गैस रिफिल एंट्री',
    gasAgency: 'गैस एजेंसी',
    schoolCardTitle: 'स्कूल फीस एंट्री',
    studentName: 'बच्चे का नाम',
    studentClass: 'कक्षा/क्लास',
    petCardTitle: 'पेट्स खर्चा',
    petName: 'पेट का नाम',
    petExpenseType: 'खर्चे का प्रकार (टीका/खाना)',
    catGas: 'गैस',
    catSchool: 'स्कूल',
    catPets: 'पेट्स',
    multiDateTitle: 'कई तारीखों के लिए एंट्री',
    multiDateHelpText: 'शुरू और अंत तारीख चुनें',
    fuelCardTitle: 'फ्यूल एंट्री',
    fuelLocationLabel: 'पेट्रोल पंप',
    fuelLitersLabel: 'लीटर',
    fuelRateLabel: 'रेट/लीटर',
    fuelAmountLabel: 'कुल रकम',
    vegCardTitle: 'सब्जी एंट्री',
    vegAmountLabel: 'रकम (₹)',
    loanCardTitle: 'उधार एंट्री',
    loanPersonLabel: 'व्यक्ति का नाम',
    loanDueDate: 'वापसी की तारीख (Optional)',
    loanOverdue: 'समय सीमा समाप्त!',
    loanDueSoon: 'जल्द देय',
    otherCardTitle: 'अन्य खर्चा',
    catBills: 'बिल',
    catGroceries: 'किराना',
    catEntertainment: 'मनोरंजन',
    catMedical: 'दवाई',
    catTravel: 'यात्रा',
    catOther: 'अन्य',
    deleteConfirm: 'क्या आप डिलीट करना चाहते हैं?',
    fillAllFields: 'कृपया सभी फील्ड भरें!',
    settled: 'सेटल',
    export: 'एक्सपोर्ट',
    about: 'ऐप के बारे में',
    infoText: 'सारा डाटा आपके फोन में सुरक्षित है।',
    today: 'आज',
    week: 'इस हफ्ते',
    month: 'इस महीने',
    total: 'कुल',
    customRange: 'कस्टम रेंज',
    addSupplier: 'सप्लायर जोड़ें',
    newSupplier: '+ नया सप्लायर',
    supplierPlaceholder: 'नाम लिखें',
    theme: 'थीम',
    dark: 'डार्क',
    light: 'लाइट',
    saved: 'सेव हो गया!',
    deleted: 'डिलीट हो गया!',
    error: 'गड़बड़ है!',
  },
  en: {
    splashTitle: 'Expense Tracker',
    splashSubtitle: 'Kharsha Tracker',
    pageTitle: 'Home',
    menuTitle: 'Menu',
    menuSubtitle: 'Choose category',
    menuMilk: 'Milk Diary',
    menuFuel: 'Fuel Tracker',
    menuVeg: 'Veg tracker',
    menuLoan: 'Loan Tracker',
    menuOther: 'Other Expenses',
    menuGas: 'Gas Refill',
    menuSchool: 'School Fees',
    menuPets: 'Pet Care',
    menuReports: 'Reports',
    menuSettings: 'Settings',
    categoryTitle: 'Expense Summary',
    recentTitle: 'Recent Entries',
    todayExpense: "Today's Total",
    thisMonth: 'This Month',
    noEntries: 'No entries found',
    milk: 'Milk',
    fuel: 'Fuel',
    veg: 'Veg',
    gas: 'Gas',
    school: 'School',
    pets: 'Pets',
    loanGiven: 'Loan Lent',
    loanTaken: 'Loan Taken',
    other: 'Other',
    milkCardTitle: 'Milk Entry',
    milkDateLabel: 'Date (Single)',
    milkSupplierLabel: 'Supplier',
    milkLitersLabel: 'Liters',
    milkRateLabel: 'Rate/L (₹)',
    milkSaveBtn: 'Save Entry',
    milkHistoryTitle: 'Milk History',
    morning: 'Morning',
    evening: 'Evening',
    bothTimes: 'Both Times',
    supplierSummaryTitle: 'Supplier Summary',
    totalMilk: 'Total Milk',
    totalCost: 'Total Cost',
    totalAdvance: 'Total Advance',
    pending: 'Pending',
    advanceLabel: 'Add Advance',
    gasCardTitle: 'Gas Refill Entry',
    gasAgency: 'Gas Agency',
    schoolCardTitle: 'School Fees Entry',
    studentName: 'Child Name',
    studentClass: 'Class',
    petCardTitle: 'Pet Expense',
    petName: 'Pet Name',
    petExpenseType: 'Type (Vaccine/Food)',
    catGas: 'Gas',
    catSchool: 'School',
    catPets: 'Pets',
    multiDateTitle: 'Multi-date Entry',
    multiDateHelpText: 'Select date range',
    fuelCardTitle: 'Fuel Entry',
    fuelLocationLabel: 'Fuel Station',
    fuelLitersLabel: 'Liters',
    fuelRateLabel: 'Rate/L',
    fuelAmountLabel: 'Total Amount',
    vegCardTitle: 'Veg Entry',
    vegAmountLabel: 'Amount (₹)',
    loanCardTitle: 'Loan Entry',
    loanPersonLabel: 'Person Name',
    loanDueDate: 'Due Date (Optional)',
    loanOverdue: 'Overdue!',
    loanDueSoon: 'Due Soon',
    otherCardTitle: 'Other Expense',
    catBills: 'Bills',
    catGroceries: 'Groceries',
    catEntertainment: 'Entertainment',
    catMedical: 'Medical',
    catTravel: 'Travel',
    catOther: 'Other',
    deleteConfirm: 'Are you sure?',
    fillAllFields: 'Fill all fields!',
    settled: 'Settled',
    export: 'Export Data',
    about: 'About App',
    infoText: 'All data is stored locally on your device.',
    today: 'Today',
    week: 'Week',
    month: 'Month',
    total: 'Total',
    customRange: 'Custom Range',
    addSupplier: 'Add Supplier',
    newSupplier: '+ New Supplier',
    supplierPlaceholder: 'Enter name',
    theme: 'Theme',
    dark: 'Dark',
    light: 'Light',
    saved: 'Saved successfully!',
    deleted: 'Deleted!',
    error: 'Error!',
  }
};

const CATEGORIES = [
  { id: 'milk', icon: Milk, color: 'bg-blue-100 text-blue-600', emoji: '🥛' },
  { id: 'fuel', icon: Fuel, color: 'bg-orange-100 text-orange-600', emoji: '⛽' },
  { id: 'veg', icon: ShoppingCart, color: 'bg-green-100 text-green-600', emoji: '🥬' },
  { id: 'gas', icon: Fuel, color: 'bg-red-100 text-red-600', emoji: '🔥' },
  { id: 'school', icon: FileText, color: 'bg-indigo-100 text-indigo-600', emoji: '🎓' },
  { id: 'pets', icon: Info, color: 'bg-yellow-100 text-yellow-600', emoji: '🐕' },
  { id: 'loan', icon: ArrowLeftRight, color: 'bg-pink-100 text-pink-600', emoji: '💰' },
  { id: 'other', icon: FileText, color: 'bg-purple-100 text-purple-600', emoji: '📝' },
];

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [view, setView] = useState<View>('dashboard');
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('lang') as Language) || 'hi');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('theme') as 'dark' | 'light') || 'dark');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // --- Theme Application ---
  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  // --- Data States ---
  const [milkSuppliers, setMilkSuppliers] = useState<MilkSupplier[]>(() => JSON.parse(localStorage.getItem('milkSuppliers') || '[{"id":1,"name":"Default Supplier","advance":0}]'));
  const [milkEntries, setMilkEntries] = useState<MilkEntry[]>(() => JSON.parse(localStorage.getItem('milkEntries') || '[]'));
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>(() => JSON.parse(localStorage.getItem('fuelEntries') || '[]'));
  const [vegEntries, setVegEntries] = useState<VegEntry[]>(() => JSON.parse(localStorage.getItem('vegEntries') || '[]'));
  const [loanEntries, setLoanEntries] = useState<LoanEntry[]>(() => JSON.parse(localStorage.getItem('loanEntries') || '[]'));
  const [otherEntries, setOtherEntries] = useState<OtherEntry[]>(() => JSON.parse(localStorage.getItem('otherEntries') || '[]'));
  const [gasEntries, setGasEntries] = useState<GasEntry[]>(() => JSON.parse(localStorage.getItem('gasEntries') || '[]'));
  const [schoolEntries, setSchoolEntries] = useState<SchoolEntry[]>(() => JSON.parse(localStorage.getItem('schoolEntries') || '[]'));
  const [petEntries, setPetEntries] = useState<PetEntry[]>(() => JSON.parse(localStorage.getItem('petEntries') || '[]'));

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('milkSuppliers', JSON.stringify(milkSuppliers));
    localStorage.setItem('milkEntries', JSON.stringify(milkEntries));
    localStorage.setItem('fuelEntries', JSON.stringify(fuelEntries));
    localStorage.setItem('vegEntries', JSON.stringify(vegEntries));
    localStorage.setItem('loanEntries', JSON.stringify(loanEntries));
    localStorage.setItem('otherEntries', JSON.stringify(otherEntries));
    localStorage.setItem('gasEntries', JSON.stringify(gasEntries));
    localStorage.setItem('schoolEntries', JSON.stringify(schoolEntries));
    localStorage.setItem('petEntries', JSON.stringify(petEntries));
    localStorage.setItem('lang', lang);
    localStorage.setItem('theme', theme);
  }, [milkSuppliers, milkEntries, fuelEntries, vegEntries, loanEntries, otherEntries, gasEntries, schoolEntries, petEntries, lang, theme]);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const t = TRANSLATIONS[lang];

  // --- Helpers ---
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const stats = useMemo(() => {
    const todayExp = 
      milkEntries.filter(e => e.date === today).reduce((sum, e) => sum + e.cost, 0) +
      fuelEntries.filter(e => e.date === today).reduce((sum, e) => sum + e.cost, 0) +
      vegEntries.filter(e => e.date === today).reduce((sum, e) => sum + e.amount, 0) +
      gasEntries.filter(e => e.date === today).reduce((sum, e) => sum + e.amount, 0) +
      schoolEntries.filter(e => e.date === today).reduce((sum, e) => sum + e.amount, 0) +
      petEntries.filter(e => e.date === today).reduce((sum, e) => sum + e.amount, 0) +
      otherEntries.filter(e => e.date === today).reduce((sum, e) => sum + e.amount, 0);

    const monthExp = 
      milkEntries.filter(e => new Date(e.date).getMonth() === currentMonth && new Date(e.date).getFullYear() === currentYear).reduce((sum, e) => sum + e.cost, 0) +
      fuelEntries.filter(e => new Date(e.date).getMonth() === currentMonth && new Date(e.date).getFullYear() === currentYear).reduce((sum, e) => sum + e.cost, 0) +
      vegEntries.filter(e => new Date(e.date).getMonth() === currentMonth && new Date(e.date).getFullYear() === currentYear).reduce((sum, e) => sum + e.amount, 0) +
      gasEntries.filter(e => new Date(e.date).getMonth() === currentMonth && new Date(e.date).getFullYear() === currentYear).reduce((sum, e) => sum + e.amount, 0) +
      schoolEntries.filter(e => new Date(e.date).getMonth() === currentMonth && new Date(e.date).getFullYear() === currentYear).reduce((sum, e) => sum + e.amount, 0) +
      petEntries.filter(e => new Date(e.date).getMonth() === currentMonth && new Date(e.date).getFullYear() === currentYear).reduce((sum, e) => sum + e.amount, 0) +
      otherEntries.filter(e => new Date(e.date).getMonth() === currentMonth && new Date(e.date).getFullYear() === currentYear).reduce((sum, e) => sum + e.amount, 0);

    return { today: todayExp, month: monthExp };
  }, [milkEntries, fuelEntries, vegEntries, otherEntries, gasEntries, schoolEntries, petEntries, today, currentMonth, currentYear]);

  // --- Handlers ---
  const handleFeatureOpen = (v: View) => {
    setView(v);
    setIsMenuOpen(false);
  };

  const handleBack = () => {
    if (view === 'dashboard') {
      // Potentially exit or confirm
    } else {
      setView('dashboard');
    }
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 gradient-bg flex items-center justify-center z-50 text-white">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-8xl mb-4 animate-bounce">💰</div>
          <h1 className="text-4xl font-bold mb-2">{t.splashTitle}</h1>
          <p className="text-white/80">{t.splashSubtitle}</p>
          <div className="mt-8 flex justify-center">
            <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`max-w-xl mx-auto min-h-screen flex flex-col pb-safe-bottom relative ${theme === 'dark' ? 'dark' : 'light'}`}>
      {/* --- Notification System --- */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] space-y-2 pointer-events-none w-[90%] max-w-sm">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`p-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md border ${
                toast.type === 'success' 
                  ? 'bg-green-500/90 border-green-400 text-white' 
                  : 'bg-red-500/90 border-red-400 text-white'
              }`}
            >
              <div className="bg-white/20 p-1.5 rounded-full">
                {toast.type === 'success' ? <CircleCheck size={18}/> : <X size={18}/>}
              </div>
              <p className="font-black tracking-tight uppercase text-xs">
                {toast.message}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* --- Header --- */}
      <header className="sticky top-0 bg-nebula-surface border-b border-nebula-border px-4 py-3 flex items-center justify-between z-30">
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="p-2 hover:bg-nebula-border rounded-lg transition-colors text-nebula-text-secondary"
        >
          <Menu size={24} />
        </button>
        <div className="flex-1 text-center font-bold text-lg text-nebula-accent tracking-tight uppercase">
          {view === 'dashboard' ? t.pageTitle : t[`menu${view.charAt(0).toUpperCase() + view.slice(1)}` as keyof typeof t]}
        </div>
        <button 
          onClick={handleBack}
          className={`${view === 'dashboard' ? 'opacity-0 cursor-default' : 'opacity-100'} p-2 hover:bg-nebula-border rounded-lg transition-all text-nebula-text-secondary`}
          disabled={view === 'dashboard'}
        >
          <ChevronLeft size={24} />
        </button>
      </header>

      {/* --- Side Menu --- */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-nebula-surface z-50 shadow-2xl flex flex-col border-r border-nebula-border"
            >
              <div className="gradient-bg p-8 text-white">
                <h3 className="text-xl font-bold tracking-tighter uppercase">{t.menuTitle}</h3>
                <p className="text-white/70 text-xs font-mono uppercase">{t.menuSubtitle}</p>
              </div>
              <nav className="flex-1 overflow-y-auto py-2">
                <MenuItem icon={<Milk size={20}/>} label={t.menuMilk} onClick={() => handleFeatureOpen('milk')} />
                <MenuItem icon={<Fuel size={20}/>} label={t.menuFuel} onClick={() => handleFeatureOpen('fuel')} />
                <MenuItem icon={<ShoppingCart size={20}/>} label={t.menuVeg} onClick={() => handleFeatureOpen('veg')} />
                <MenuItem icon={<Fuel size={20}/>} label={t.menuGas} onClick={() => handleFeatureOpen('gas')} />
                <MenuItem icon={<FileText size={20}/>} label={t.menuSchool} onClick={() => handleFeatureOpen('school')} />
                <MenuItem icon={<Info size={20}/>} label={t.menuPets} onClick={() => handleFeatureOpen('pets')} />
                <MenuItem icon={<Wallet size={20}/>} label={t.menuLoan} onClick={() => handleFeatureOpen('loan')} />
                <MenuItem icon={<FileText size={20}/>} label={t.menuOther} onClick={() => handleFeatureOpen('other')} />
                <div className="border-t my-2" />
                <MenuItem icon={<TrendingUp size={20}/>} label={t.menuReports} onClick={() => handleFeatureOpen('reports')} />
                <MenuItem icon={<Settings size={20}/>} label={t.menuSettings} onClick={() => handleFeatureOpen('settings')} />
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 p-4">
        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <Dashboard 
              key="dashboard"
              stats={stats} 
              t={t} 
              onFeatureClick={handleFeatureOpen}
              entries={[...milkEntries, ...fuelEntries, ...vegEntries, ...gasEntries, ...schoolEntries, ...petEntries, ...otherEntries].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)}
              onNav={handleFeatureOpen}
              loanEntries={loanEntries}
            />
          )}

          {view === 'milk' && (
            <MilkFeature 
              key="milk"
              t={t} 
              suppliers={milkSuppliers} 
              entries={milkEntries}
              setSuppliers={setMilkSuppliers}
              setEntries={setMilkEntries}
              addToast={addToast}
            />
          )}

          {view === 'fuel' && (
            <FuelFeature 
              key="fuel"
              t={t} 
              entries={fuelEntries}
              setEntries={setFuelEntries}
              addToast={addToast}
            />
          )}

          {view === 'veg' && (
            <VegFeature 
              key="veg"
              t={t} 
              entries={vegEntries}
              setEntries={setVegEntries}
              addToast={addToast}
            />
          )}

          {view === 'loan' && (
            <LoanFeature 
              key="loan"
              t={t} 
              entries={loanEntries}
              setEntries={setLoanEntries}
              addToast={addToast}
            />
          )}

          {view === 'other' && (
            <OtherFeature 
              key="other"
              t={t}
              entries={otherEntries}
              setEntries={setOtherEntries}
              addToast={addToast}
            />
          )}

          {view === 'gas' && (
            <GasFeature 
              key="gas"
              t={t}
              entries={gasEntries}
              setEntries={setGasEntries}
              addToast={addToast}
            />
          )}

          {view === 'school' && (
            <SchoolFeature 
              key="school"
              t={t}
              entries={schoolEntries}
              setEntries={setSchoolEntries}
              addToast={addToast}
            />
          )}

          {view === 'pets' && (
            <PetFeature 
              key="pets"
              t={t}
              entries={petEntries}
              setEntries={setPetEntries}
              addToast={addToast}
            />
          )}

          {view === 'reports' && (
            <ReportsFeature 
              key="reports"
              t={t}
              data={{ milkEntries, fuelEntries, vegEntries, loanEntries, otherEntries }}
            />
          )}

          {view === 'settings' && (
            <SettingsFeature 
              key="settings"
              t={t} 
              currentLang={lang} 
              setLang={setLang} 
              theme={theme}
              setTheme={setTheme}
              allData={{ milkSuppliers, milkEntries, fuelEntries, vegEntries, loanEntries, otherEntries }}
              addToast={addToast}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Footer bar for quick navigation on dashboard */}
      {view === 'dashboard' && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-nebula-surface/80 backdrop-blur-md border-t border-nebula-border flex justify-around safe-bottom z-30">
           <button onClick={() => handleFeatureOpen('milk')} className="p-3 bg-blue-900/30 text-blue-400 rounded-full hover:scale-110 transition-transform border border-blue-500/20"><Milk size={20}/></button>
           <button onClick={() => handleFeatureOpen('fuel')} className="p-3 bg-orange-900/30 text-orange-400 rounded-full hover:scale-110 transition-transform border border-orange-500/20"><Fuel size={20}/></button>
           <button onClick={() => handleFeatureOpen('veg')} className="p-3 bg-green-900/30 text-green-400 rounded-full hover:scale-110 transition-transform border border-green-500/20"><ShoppingCart size={20}/></button>
           <button onClick={() => handleFeatureOpen('loan')} className="p-3 bg-pink-900/30 text-pink-400 rounded-full hover:scale-110 transition-transform border border-pink-500/20"><ArrowLeftRight size={20}/></button>
           <button onClick={() => handleFeatureOpen('other')} className="p-3 bg-purple-900/30 text-purple-400 rounded-full hover:scale-110 transition-transform border border-purple-500/20"><FileText size={20}/></button>
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-4 px-6 py-4 hover:bg-nebula-border transition-colors text-nebula-text-primary font-medium border-b border-nebula-border"
    >
      <span className="text-nebula-accent">{icon}</span>
      <span className="uppercase tracking-tight text-sm">{label}</span>
    </button>
  );
}

// --- Features ---

function Dashboard({ stats, t, onFeatureClick, entries, loanEntries }: any) {
  const overdueLoans = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return loanEntries.filter((l: any) => !l.settled && l.dueDate && l.dueDate < today);
  }, [loanEntries]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      {/* Overdue Alert */}
      {overdueLoans.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6 relative overflow-hidden group cursor-pointer" onClick={() => onFeatureClick('loan')}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500 text-white rounded-lg shadow-lg animate-pulse">
              <CircleCheck size={20} className="rotate-180" />
            </div>
            <div>
              <p className="text-red-500 text-xs font-black uppercase tracking-widest">{t.loanOverdue}</p>
              <p className="text-xs font-bold text-red-700 uppercase tracking-tight">{overdueLoans.length} {t.menuLoan} {t.pending}</p>
            </div>
            <ArrowLeftRight size={24} className="ml-auto text-red-500/30 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="gradient-bg p-5 rounded-2xl text-white card-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-20"><TrendingUp size={48}/></div>
          <p className="text-blue-200 text-xs font-black uppercase tracking-widest mb-1 opacity-70">{t.todayExpense}</p>
          <p className="text-3xl font-black tracking-tighter font-mono">₹{stats.today.toFixed(2)}</p>
        </div>
        <div className="bg-nebula-surface p-5 rounded-2xl border border-nebula-border card-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 text-nebula-accent opacity-10"><PulseCircle /></div>
          <p className="text-nebula-text-secondary text-xs font-black uppercase tracking-widest mb-1">{t.thisMonth}</p>
          <p className="text-3xl font-black text-nebula-text-primary tracking-tighter font-mono">₹{stats.month.toFixed(2)}</p>
        </div>
      </div>

      {/* Action Grid */}
      <div className="bg-nebula-surface rounded-2xl p-4 mb-6 card-shadow border border-nebula-border">
        <h3 className="text-xs font-black text-nebula-text-secondary mb-4 border-l-4 border-nebula-accent pl-3 uppercase tracking-widest">{t.categoryTitle}</h3>
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => onFeatureClick(cat.id as View)}
              className="flex items-center gap-3 p-3 rounded-xl border border-nebula-border bg-nebula-deep hover:bg-nebula-border transition-all active:scale-95 group"
            >
              <div className={`p-2 rounded-lg ${cat.color.replace('bg-', 'bg-opacity-20 bg-')} group-hover:scale-110 transition-transform text-xl`}>
                {cat.emoji}
              </div>
              <span className="font-bold text-nebula-text-primary text-xs uppercase tracking-tight">{t[cat.id as keyof typeof t]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Entries */}
      <div className="bg-nebula-surface rounded-2xl p-4 card-shadow border border-nebula-border mb-20">
        <h3 className="text-xs font-black text-nebula-text-secondary mb-4 border-l-4 border-nebula-accent pl-3 uppercase tracking-widest">{t.recentTitle}</h3>
        <div className="space-y-3">
          {entries.length === 0 ? (
            <div className="text-center py-10">
              <Info size={40} className="mx-auto text-nebula-border mb-2" />
              <p className="text-nebula-text-secondary text-xs uppercase font-black tracking-tighter">{t.noEntries}</p>
            </div>
          ) : (
            entries.map((e: any) => (
              <div key={e.id} className="flex items-center justify-between p-3 bg-nebula-deep rounded-xl border border-nebula-border">
                <div className="flex items-center gap-3">
                  <div className="text-xl">
                    {e.supplierId ? '🥛' : (e.location ? '⛽' : (e.shopName ? '🥬' : (e.agency ? '🔥' : (e.studentName ? '🎓' : (e.petName ? '🐕' : '📝')))))}
                  </div>
                  <div>
                    <p className="text-[11px] text-nebula-text-secondary font-black uppercase tracking-tighter">{e.date}</p>
                    <p className="text-xs font-bold text-nebula-text-primary truncate max-w-[150px] uppercase">
                      {e.supplierName || e.location || e.shopName || e.agency || e.studentName || e.petName || e.category}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-nebula-text-primary tracking-tighter font-mono">₹{(e.cost || e.amount).toFixed(2)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}

function PulseCircle() {
  return (
    <div className="relative flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
    </div>
  );
}

function MilkFeature({ t, suppliers, entries, setSuppliers, setEntries, addToast }: any) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [supplierId, setSupplierId] = useState('');
  const [time, setTime] = useState<'morning' | 'evening' | 'both'>('morning');
  const [liters, setLiters] = useState('');
  const [rate, setRate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');

  // Multi-date state
  const [isMultiDate, setIsMultiDate] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredEntries = useMemo(() => {
    return entries.filter((e: any) => 
      e.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.date.includes(searchTerm)
    );
  }, [entries, searchTerm]);

  const displayedEntries = showAll ? filteredEntries : filteredEntries.slice(0, 10);

  const handleAddSupplier = () => {
    if (!newSupplierName.trim()) return;
    const newSupplier = { id: Date.now(), name: newSupplierName, advance: 0 };
    setSuppliers([...suppliers, newSupplier]);
    setSupplierId(newSupplier.id.toString());
    setNewSupplierName('');
    setShowAddSupplier(false);
    addToast(t.saved);
  };

  const [editingId, setEditingId] = useState<number | null>(null);

  const handleSave = () => {
    if (!supplierId || !liters || !rate) {
      addToast(t.fillAllFields, 'error');
      return;
    }

    const supplier = suppliers.find((s: any) => s.id === parseInt(supplierId));
    if (!supplier) return;

    const createEntriesForDate = (dStr: string) => {
      const times: ('morning' | 'evening')[] = time === 'both' ? ['morning', 'evening'] : [time];
      const added: any[] = [];
      times.forEach(tCode => {
        if (!entries.find((e: any) => e.date === dStr && e.supplierId === supplier.id && e.time === tCode)) {
          added.push({
            id: Date.now() + Math.random(),
            date: dStr,
            supplierId: supplier.id,
            supplierName: supplier.name,
            liters: parseFloat(liters),
            rate: parseFloat(rate),
            cost: parseFloat(liters) * parseFloat(rate),
            time: tCode
          });
        }
      });
      return added;
    };

    if (editingId) {
      setEntries(entries.map((e: any) => e.id === editingId ? {
        ...e,
        date, supplierId: supplier.id, supplierName: supplier.name, liters: parseFloat(liters), rate: parseFloat(rate), cost: parseFloat(liters) * parseFloat(rate), time: time === 'both' ? 'morning' : time
      } : e).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setEditingId(null);
      addToast(t.saved);
    } else if (isMultiDate) {
      if (new Date(startDate) > new Date(endDate)) {
        addToast("Select valid range", 'error');
        return;
      }
      
      const newEntries: any[] = [];
      let curr = new Date(startDate);
      const last = new Date(endDate);
      
      while (curr <= last) {
        const dStr = curr.toISOString().split('T')[0];
        newEntries.push(...createEntriesForDate(dStr));
        curr.setDate(curr.getDate() + 1);
      }
      setEntries([...newEntries, ...entries].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      addToast(`${t.saved} (${newEntries.length} entries)`);
    } else {
      const newEntries = createEntriesForDate(date);
      if (newEntries.length === 0) {
        addToast("Entry already exists", 'error');
        return;
      }

      setEntries([...newEntries, ...entries].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      addToast(t.saved);
    }
  };

  const startEdit = (e: any) => {
    setEditingId(e.id);
    setDate(e.date);
    setSupplierId(e.supplierId.toString());
    setLiters(e.liters.toString());
    setRate(e.rate.toString());
    setTime(e.time);
    setIsMultiDate(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteEntry = (id: number) => {
    setEntries((prev: any) => prev.filter((e: any) => e.id !== id));
    addToast(t.deleted);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="bg-nebula-surface rounded-2xl p-6 card-shadow border border-nebula-border mb-6">
        <div className="flex items-center gap-2 mb-6 text-nebula-accent">
          <div className="p-2 bg-blue-900/40 rounded-lg">🥛</div>
          <h2 className="text-lg font-extrabold uppercase tracking-tight text-nebula-text-primary">{t.milkCardTitle}</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-nebula-text-secondary uppercase">{t.multiDateTitle}</span>
            <button 
              onClick={() => setIsMultiDate(!isMultiDate)}
              className={`w-12 h-6 rounded-full transition-colors relative ${isMultiDate ? 'bg-nebula-accent' : 'bg-nebula-border'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isMultiDate ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {isMultiDate ? (
            <div className="grid grid-cols-2 gap-2">
              <Input label="Start" type="date" value={startDate} onChange={setStartDate} />
              <Input label="End" type="date" value={endDate} onChange={setEndDate} />
            </div>
          ) : (
            <Input label={t.milkDateLabel} type="date" value={date} onChange={setDate} />
          )}

          <div>
             <div className="flex justify-between items-center mb-1">
               <label className="block text-[10px] font-black text-nebula-text-secondary uppercase tracking-widest">{t.milkSupplierLabel}</label>
               <button onClick={() => setShowAddSupplier(true)} className="text-[10px] font-black text-nebula-accent uppercase hover:underline">{t.newSupplier}</button>
             </div>
             <select value={supplierId} onChange={e => setSupplierId(e.target.value)} className="w-full p-3 bg-nebula-deep border border-nebula-border text-nebula-text-primary rounded-xl text-sm font-bold outline-none">
                <option value="">CHOOSE SUPPLIER</option>
                {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
             </select>
          </div>

          <AnimatePresence>
            {showAddSupplier && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-nebula-deep border border-nebula-border rounded-xl mt-2 space-y-3">
                  <Input 
                    label={t.addSupplier} 
                    type="text" 
                    value={newSupplierName} 
                    onChange={setNewSupplierName} 
                    placeholder={t.supplierPlaceholder}
                  />
                  <div className="flex gap-2">
                    <button onClick={handleAddSupplier} className="flex-1 gradient-bg text-white py-2 rounded-lg text-xs font-black uppercase tracking-widest">ADD</button>
                    <button onClick={() => setShowAddSupplier(false)} className="px-4 py-2 bg-nebula-surface text-nebula-text-secondary border border-nebula-border rounded-lg text-xs font-black uppercase tracking-widest">CANCEL</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-2">
            <button 
              onClick={() => setTime('morning')}
              className={`flex-1 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${time === 'morning' ? 'bg-nebula-accent text-white shadow-lg border border-nebula-accent' : 'bg-nebula-deep text-nebula-text-secondary border border-nebula-border'}`}
            >
              🌅 {t.morning}
            </button>
            <button 
              onClick={() => setTime('evening')}
              className={`flex-1 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${time === 'evening' ? 'bg-nebula-accent text-white shadow-lg border border-nebula-accent' : 'bg-nebula-deep text-nebula-text-secondary border border-nebula-border'}`}
            >
              🌙 {t.evening}
            </button>
            <button 
              onClick={() => setTime('both')}
              className={`flex-1 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${time === 'both' ? 'bg-nebula-accent text-white shadow-lg border border-nebula-accent' : 'bg-nebula-deep text-nebula-text-secondary border border-nebula-border'}`}
            >
              🌓 {t.bothTimes}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label={t.milkLitersLabel} type="number" value={liters} onChange={setLiters} placeholder="0.0" />
            <Input label={t.milkRateLabel} type="number" value={rate} onChange={setRate} placeholder="0.0" />
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleSave}
              className="flex-1 gradient-bg text-white p-4 rounded-xl font-black tracking-widest uppercase shadow-xl active:scale-95 transition-transform"
            >
              {editingId ? 'UPDATE' : t.milkSaveBtn}
            </button>
            {editingId && (
              <button 
                onClick={() => { setEditingId(null); setLiters(''); }}
                className="px-4 bg-nebula-deep border border-nebula-border text-nebula-text-secondary rounded-xl uppercase text-[10px] font-black"
              >
                CANCEL
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-nebula-surface rounded-2xl p-4 card-shadow border border-nebula-border mb-6">
        <h3 className="text-xs font-black text-nebula-text-secondary mb-4 border-l-4 border-nebula-accent pl-3 uppercase tracking-widest">{t.supplierSummaryTitle}</h3>
        <div className="space-y-3">
          {suppliers.map((s: any) => {
            const supplierEntries = entries.filter((e: any) => e.supplierId === s.id);
            const totalLiters = supplierEntries.reduce((sum: number, e: any) => sum + e.liters, 0);
            const totalCost = supplierEntries.reduce((sum: number, e: any) => sum + e.cost, 0);
            const pending = totalCost - (s.advance || 0);

            return (
              <div key={s.id} className="p-3 bg-nebula-deep rounded-xl border border-nebula-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-nebula-text-primary uppercase text-xs tracking-tight">🏪 {s.name}</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        const amt = prompt(t.advanceLabel);
                        if (amt) {
                          setSuppliers(suppliers.map((sup: any) => 
                            sup.id === s.id ? { ...sup, advance: (sup.advance || 0) + parseFloat(amt) } : sup
                          ));
                          addToast(t.saved);
                        }
                      }}
                      className="text-[9px] font-black px-2 py-1 bg-nebula-accent/20 text-nebula-accent border border-nebula-accent/30 rounded-md uppercase tracking-widest hover:bg-nebula-accent/30 transition-colors"
                    >
                      + {t.advanceLabel}
                    </button>
                    <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${pending > 0 ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'}`}>
                      {pending > 0 ? `₹${pending.toFixed(2)} ${t.pending}` : 'SETTLED'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-black text-nebula-text-secondary uppercase">
                  <div className="flex items-center gap-1">
                    <span className="opacity-70 text-base">🥛</span>
                    <span className="text-nebula-text-primary">{totalLiters.toFixed(1)}L</span>
                    <span className="text-[8px] opacity-60 uppercase">TOTAL</span>
                  </div>
                  <div className="text-right flex items-center justify-end gap-1 font-mono">
                    <span className="opacity-70 text-base">💰</span>
                    <span className="text-nebula-accent">₹{totalCost.toFixed(2)}</span>
                    <span className="text-[8px] opacity-60 uppercase">TOTAL</span>
                  </div>
                </div>
                {s.advance > 0 && (
                  <div className="mt-2 pt-2 border-t border-nebula-border/50 text-[9px] font-bold text-blue-400 uppercase flex justify-between">
                    <span>{t.totalAdvance}:</span>
                    <span>₹{s.advance.toFixed(2)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-nebula-surface rounded-2xl p-4 card-shadow border border-nebula-border mb-8">
        <div className="flex items-center justify-between mb-4 border-l-4 border-nebula-accent pl-3">
          <h3 className="text-xs font-black text-nebula-text-secondary uppercase tracking-widest">{t.milkHistoryTitle}</h3>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              placeholder="Search..." 
              className="bg-nebula-deep border border-nebula-border rounded-lg px-2 py-1 text-[10px] text-nebula-text-primary outline-none focus:border-nebula-accent w-24"
            />
          </div>
        </div>
        <div className="space-y-3">
          {displayedEntries.length === 0 ? <p className="text-center text-nebula-text-secondary py-6 font-black uppercase text-[10px]">{t.noEntries}</p> : displayedEntries.map((e: any) => (
            <div key={e.id} className="flex items-center justify-between p-3 bg-nebula-deep rounded-xl border border-nebula-border">
              <div className="flex-1">
                <p className="text-[11px] font-black text-nebula-text-secondary uppercase tracking-tighter">{e.date} • {e.time === 'morning' ? '🌅' : '🌙'}</p>
                <p className="text-xs font-bold text-nebula-text-primary uppercase">{e.supplierName} | {e.liters}L @ ₹{e.rate}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-black text-nebula-text-primary tracking-tighter font-mono">₹{e.cost.toFixed(2)}</p>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(e)} className="text-nebula-accent hover:text-blue-600 transition-colors"><Pencil size={18}/></button>
                  <button onClick={() => deleteEntry(e.id)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={18}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filteredEntries.length > 10 && (
          <button 
            onClick={() => setShowAll(!showAll)}
            className="w-full mt-4 py-2 border border-dashed border-nebula-border rounded-xl text-[10px] font-black text-nebula-text-secondary hover:bg-nebula-deep transition-colors uppercase tracking-widest"
          >
            {showAll ? 'SHOW LESS' : `ALL HISTORY (${filteredEntries.length})`}
          </button>
        )}
      </div>
    </motion.div>
  );
}

function FuelFeature({ t, entries, setEntries, addToast }: any) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [method, setMethod] = useState<'liter' | 'money'>('liter');
  const [liters, setLiters] = useState('');
  const [rate, setRate] = useState('');
  const [amount, setAmount] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);

  const filteredEntries = useMemo(() => {
    return entries.filter((e: any) => 
      e.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.date.includes(searchTerm)
    );
  }, [entries, searchTerm]);

  const displayedEntries = showAll ? filteredEntries : filteredEntries.slice(0, 10);

  const handleSave = () => {
    if (!location || (method === 'liter' && (!liters || !rate)) || (method === 'money' && !amount)) {
      addToast(t.fillAllFields, 'error');
      return;
    }

    const calculatedCost = method === 'liter' ? parseFloat(liters) * parseFloat(rate) : parseFloat(amount);
    
    if (editingId) {
      setEntries(entries.map((e: any) => e.id === editingId ? {
        ...e,
        date, location, liters: method === 'liter' ? parseFloat(liters) : undefined, rate: method === 'liter' ? parseFloat(rate) : undefined,
        cost: calculatedCost, method, note: method === 'liter' ? `${liters}L @ ₹${rate}` : `₹${amount}`
      } : e).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setEditingId(null);
      addToast(t.saved);
    } else {
      const entry = {
        id: Date.now(),
        date,
        location,
        liters: method === 'liter' ? parseFloat(liters) : undefined,
        rate: method === 'liter' ? parseFloat(rate) : undefined,
        cost: calculatedCost,
        method,
        note: method === 'liter' ? `${liters}L @ ₹${rate}` : `₹${amount}`
      };

      setEntries([entry, ...entries].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      addToast(t.saved);
    }
    setLocation(''); setLiters(''); setRate(''); setAmount('');
  };

  const startEdit = (e: any) => {
    setEditingId(e.id);
    setDate(e.date);
    setLocation(e.location);
    setMethod(e.method);
    if (e.method === 'liter') {
      setLiters(e.liters.toString());
      setRate(e.rate.toString());
    } else {
      // Extract amount from note if cost is not just amount
      setAmount(e.cost.toString());
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="bg-nebula-surface rounded-2xl p-6 card-shadow border border-nebula-border mb-6">
        <div className="flex items-center gap-2 mb-6 text-orange-500">
          <div className="p-2 bg-orange-900/40 rounded-lg">⛽</div>
          <h2 className="text-lg font-extrabold uppercase tracking-tight text-nebula-text-primary">{t.fuelCardTitle}</h2>
        </div>

        <div className="space-y-4">
          <Input label={t.fuelDateLabel} type="date" value={date} onChange={setDate} />
          <Input label={t.fuelLocationLabel} type="text" value={location} onChange={setLocation} placeholder="Station Name" />

          <div className="flex gap-2">
            <button onClick={() => setMethod('liter')} className={`flex-1 p-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${method === 'liter' ? 'bg-nebula-accent text-white shadow-lg' : 'bg-nebula-deep text-nebula-text-secondary border border-nebula-border'}`}>📊 LITER</button>
            <button onClick={() => setMethod('money')} className={`flex-1 p-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${method === 'money' ? 'bg-nebula-accent text-white shadow-lg' : 'bg-nebula-deep text-nebula-text-secondary border border-nebula-border'}`}>💰 MONEY</button>
          </div>

          {method === 'liter' ? (
            <div className="grid grid-cols-2 gap-4">
              <Input label={t.fuelLitersLabel} type="number" value={liters} onChange={setLiters} placeholder="0.0" />
              <Input label={t.fuelRateLabel} type="number" value={rate} onChange={setRate} placeholder="0.0" />
            </div>
          ) : (
            <Input label={t.fuelAmountLabel} type="number" value={amount} onChange={setAmount} placeholder="0" />
          )}

          <div className="flex gap-2">
            <button onClick={handleSave} className="flex-1 gradient-bg text-white p-4 rounded-xl font-black tracking-widest uppercase shadow-xl active:scale-95 transition-transform">
              {editingId ? 'UPDATE' : t.fuelSaveBtn}
            </button>
            {editingId && (
              <button 
                onClick={() => { setEditingId(null); setLocation(''); setLiters(''); setRate(''); setAmount(''); }}
                className="px-4 bg-nebula-deep border border-nebula-border text-nebula-text-secondary rounded-xl uppercase text-[10px] font-black"
              >
                CANCEL
              </button>
            )}
          </div>
        </div>
      </div>

       <div className="bg-nebula-surface rounded-2xl p-4 card-shadow border border-nebula-border mb-8">
        <div className="flex items-center justify-between mb-4 border-l-4 border-nebula-accent pl-3">
          <h3 className="text-xs font-black text-nebula-text-secondary uppercase tracking-widest">{t.fuelHistoryTitle}</h3>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              placeholder="Search..." 
              className="bg-nebula-deep border border-nebula-border rounded-lg px-2 py-1 text-[10px] text-nebula-text-primary outline-none focus:border-nebula-accent w-24"
            />
          </div>
        </div>
        <div className="space-y-3">
          {displayedEntries.length === 0 ? <p className="text-center text-nebula-text-secondary py-6 font-black uppercase text-[10px]">{t.noEntries}</p> : displayedEntries.map((e: any) => (
            <div key={e.id} className="flex items-center justify-between p-3 bg-nebula-deep rounded-xl border border-nebula-border">
              <div className="flex-1">
                <p className="text-[11px] font-black text-nebula-text-secondary uppercase tracking-wider tracking-tighter">{e.date}</p>
                <p className="text-xs font-bold text-nebula-text-primary uppercase tracking-tight truncate max-w-[140px]">📍 {e.location}</p>
                <p className="text-xs text-nebula-text-secondary font-medium tracking-tighter">{e.note}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-black text-nebula-text-primary tracking-tighter font-mono">₹{e.cost.toFixed(2)}</p>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(e)} className="text-nebula-accent hover:text-blue-600 transition-colors"><Pencil size={18}/></button>
                  <button onClick={() => { setEntries((prev: any) => prev.filter((en:any) => en.id !== e.id)); addToast(t.deleted); }} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={18}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filteredEntries.length > 10 && (
          <button 
            onClick={() => setShowAll(!showAll)}
            className="w-full mt-4 py-2 border border-dashed border-nebula-border rounded-xl text-[10px] font-black text-nebula-text-secondary hover:bg-nebula-deep transition-colors uppercase tracking-widest"
          >
            {showAll ? 'SHOW LESS' : `ALL HISTORY (${filteredEntries.length})`}
          </button>
        )}
      </div>
    </motion.div>
  );
}

function VegFeature({ t, entries, setEntries, addToast }: any) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shopName, setShopName] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const filteredEntries = useMemo(() => {
    return entries.filter((e: any) => 
      e.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.date.includes(searchTerm)
    );
  }, [entries, searchTerm]);

  const displayedEntries = showAll ? filteredEntries : filteredEntries.slice(0, 10);

  const handleSave = () => {
    if (!shopName || !amount) { addToast(t.fillAllFields, 'error'); return; }
    
    if (editingId) {
      setEntries(entries.map((e: any) => e.id === editingId ? {
        ...e, date, shopName, amount: parseFloat(amount), note
      } : e).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setEditingId(null);
      addToast(t.saved);
    } else {
      const entry = { id: Date.now(), date, shopName, amount: parseFloat(amount), note };
      setEntries([entry, ...entries].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      addToast(t.saved);
    }
    setShopName(''); setAmount(''); setNote('');
  };

  const startEdit = (e: any) => {
    setEditingId(e.id);
    setDate(e.date);
    setShopName(e.shopName);
    setAmount(e.amount.toString());
    setNote(e.note || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
       <div className="bg-nebula-surface rounded-2xl p-6 card-shadow border border-nebula-border mb-6">
        <div className="flex items-center gap-2 mb-6 text-green-500 font-bold uppercase tracking-wider">
          <div className="p-2 bg-green-900/40 rounded-lg">🥬</div>
          <h2 className="text-lg font-extrabold tracking-tight text-nebula-text-primary">{t.vegCardTitle}</h2>
        </div>
        <div className="space-y-4">
          <Input label="DATE" type="date" value={date} onChange={setDate} />
          <Input label="SHOP NAME" type="text" value={shopName} onChange={setShopName} placeholder="Ramu Veg Shop" />
          <Input label="AMOUNT (₹)" type="number" value={amount} onChange={setAmount} placeholder="0" />
          <Input label="NOTE" type="text" value={note} onChange={setNote} placeholder="Items list..." />
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex-1 gradient-bg text-white p-4 rounded-xl font-black tracking-widest uppercase shadow-xl active:scale-95 transition-transform">
              {editingId ? 'UPDATE' : 'SAVE'}
            </button>
            {editingId && (
              <button 
                onClick={() => { setEditingId(null); setShopName(''); setAmount(''); setNote(''); }}
                className="px-4 bg-nebula-deep border border-nebula-border text-nebula-text-secondary rounded-xl uppercase text-[10px] font-black"
              >
                CANCEL
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="bg-nebula-surface rounded-2xl p-4 card-shadow border border-nebula-border mb-8">
        <div className="flex items-center justify-between mb-4 border-l-4 border-nebula-accent pl-3">
          <h3 className="text-xs font-black text-nebula-text-secondary uppercase tracking-widest">{t.vegHistoryTitle}</h3>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              placeholder="Search..." 
              className="bg-nebula-deep border border-nebula-border rounded-lg px-2 py-1 text-[10px] text-nebula-text-primary outline-none focus:border-nebula-accent w-24"
            />
          </div>
        </div>
        <div className="space-y-3">
          {displayedEntries.length === 0 ? <p className="text-center text-nebula-text-secondary py-6 font-black text-[10px] uppercase">{t.noEntries}</p> : displayedEntries.map((e: any) => (
            <div key={e.id} className="flex items-center justify-between p-3 bg-nebula-deep rounded-xl border border-nebula-border">
              <div className="flex-1">
                <p className="text-[9px] font-black text-nebula-text-secondary uppercase whitespace-nowrap tracking-tighter">{e.date}</p>
                <p className="text-xs font-bold text-nebula-text-primary uppercase tracking-tight">🥬 {e.shopName}</p>
                {e.note && <p className="text-xs text-nebula-text-secondary font-medium tracking-tighter">{e.note}</p>}
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-black text-nebula-text-primary tracking-tighter font-mono">₹{e.amount.toFixed(2)}</p>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(e)} className="text-nebula-accent hover:text-blue-600 transition-colors"><Pencil size={18}/></button>
                  <button onClick={() => { setEntries((prev: any) => prev.filter((en:any) => en.id !== e.id)); addToast(t.deleted); }} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={18}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filteredEntries.length > 10 && (
          <button 
            onClick={() => setShowAll(!showAll)}
            className="w-full mt-4 py-2 border border-dashed border-nebula-border rounded-xl text-[10px] font-black text-nebula-text-secondary hover:bg-nebula-deep transition-colors uppercase tracking-widest"
          >
            {showAll ? 'SHOW LESS' : `ALL HISTORY (${filteredEntries.length})`}
          </button>
        )}
      </div>
    </motion.div>
  );
}

function LoanFeature({ t, entries, setEntries, addToast }: any) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [type, setType] = useState<'given' | 'taken'>('given');
  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleSave = () => {
    if (!person || !amount) { addToast(t.fillAllFields, 'error'); return; }
    
    if (editingId) {
      setEntries(entries.map((e: any) => e.id === editingId ? {
        ...e, date, type, person, amount: parseFloat(amount), note, dueDate: dueDate || undefined
      } : e).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setEditingId(null);
      addToast(t.saved);
    } else {
      const entry = { id: Date.now(), date, type, person, amount: parseFloat(amount), note, settled: false, dueDate: dueDate || undefined };
      setEntries([entry, ...entries].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      addToast(t.saved);
    }
    setPerson(''); setAmount(''); setNote(''); setDueDate('');
  };

  const startEdit = (e: any) => {
    setEditingId(e.id);
    setDate(e.date);
    setType(e.type);
    setPerson(e.person);
    setAmount(e.amount.toString());
    setDueDate(e.dueDate || '');
    setNote(e.note || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSettle = (id: number) => {
    setEntries(entries.map((e: any) => e.id === id ? { ...e, settled: !e.settled } : e));
    addToast(t.saved);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
       <div className="bg-nebula-surface rounded-2xl p-6 card-shadow border border-nebula-border mb-6">
        <div className="flex items-center gap-2 mb-6 text-pink-500">
          <div className="p-2 bg-pink-900/40 rounded-lg">💰</div>
          <h2 className="text-lg font-black tracking-tight text-nebula-text-primary uppercase">{t.loanCardTitle}</h2>
        </div>
        <div className="space-y-4">
          <Input label="DATE" type="date" value={date} onChange={setDate} />
          <div className="flex gap-2">
            <button onClick={() => setType('given')} className={`flex-1 p-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${type === 'given' ? 'bg-nebula-accent text-white shadow-lg' : 'bg-nebula-deep text-nebula-text-secondary border border-nebula-border'}`}>GIVEN (दिया)</button>
            <button onClick={() => setType('taken')} className={`flex-1 p-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${type === 'taken' ? 'bg-nebula-accent text-white shadow-lg' : 'bg-nebula-deep text-nebula-text-secondary border border-nebula-border'}`}>TAKEN (लिया)</button>
          </div>
          <Input label={t.loanPersonLabel} type="text" value={person} onChange={setPerson} placeholder="Name" />
          <Input label="AMOUNT (₹)" type="number" value={amount} onChange={setAmount} placeholder="0" />
          <Input label={t.loanDueDate} type="date" value={dueDate} onChange={setDueDate} />
          <Input label="NOTE" type="text" value={note} onChange={setNote} placeholder="Return details..." />
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex-1 gradient-bg text-white p-4 rounded-xl font-black uppercase tracking-widest active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-xl">
              <Save size={18}/> {editingId ? 'UPDATE' : 'SAVE'}
            </button>
            {editingId && (
              <button 
                onClick={() => { setEditingId(null); setPerson(''); setAmount(''); setNote(''); setDueDate(''); }}
                className="px-4 bg-nebula-deep border border-nebula-border text-nebula-text-secondary rounded-xl uppercase text-[10px] font-black"
              >
                CANCEL
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="space-y-6 mb-20">
        <LoanSection title={t.loanGivenTitle} entries={entries.filter((e: any) => e.type === "given")} onSettle={toggleSettle} onDelete={(id:number) => { setEntries((prev: any) => prev.filter((en:any)=>en.id!==id)); addToast(t.deleted); }} onEdit={startEdit} t={t} color="text-pink-400" />
        <LoanSection title={t.loanTakenTitle} entries={entries.filter((e: any) => e.type === "taken")} onSettle={toggleSettle} onDelete={(id:number) => { setEntries((prev: any) => prev.filter((en:any)=>en.id!==id)); addToast(t.deleted); }} onEdit={startEdit} t={t} color="text-nebula-accent" />
      </div>
    </motion.div>
  );
}

function LoanSection({ title, entries, onSettle, onDelete, onEdit, t, color }: any) {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-nebula-surface rounded-2xl p-4 card-shadow border border-nebula-border">
      <h3 className={`text-xs font-black text-nebula-text-secondary mb-4 border-l-4 border-nebula-accent pl-3 uppercase tracking-tight`}>{title}</h3>
      <div className="space-y-3">
        {entries.length === 0 ? <p className="text-center text-nebula-text-secondary py-6 font-black uppercase text-[10px]">{t.noEntries}</p> : entries.map((e: any) => (
          <div key={e.id} className={`flex items-center justify-between p-3 rounded-xl border border-nebula-border ${e.settled ? 'opacity-30 grayscale' : 'bg-nebula-deep'} ${!e.settled && e.dueDate && e.dueDate < today ? 'border-red-500/50 bg-red-500/5' : ''}`}>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[11px] font-black text-nebula-text-secondary tracking-wider tracking-tighter">{e.date}</p>
                {!e.settled && e.dueDate && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${e.dueDate < today ? 'bg-red-500 text-white' : 'bg-orange-500/20 text-orange-600 dark:text-orange-400'}`}>
                    {e.dueDate < today ? t.loanOverdue : `${t.loanDueSoon}: ${e.dueDate}`}
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-nebula-text-primary uppercase tracking-tight">👤 {e.person}</p>
              <p className="text-xs text-nebula-text-secondary font-medium tracking-tighter">{e.note}</p>
            </div>
            <div className="text-right flex items-center gap-3">
              <p className={`text-sm font-black tracking-tight font-mono ${color}`}>₹{e.amount.toFixed(2)}</p>
              <div className="flex flex-col gap-1">
                <button onClick={() => onSettle(e.id)} className={`p-1 rounded-md transition-colors ${e.settled ? 'text-green-400' : 'text-nebula-border hover:text-nebula-text-secondary'}`}><CircleCheck size={18}/></button>
                <div className="flex gap-2">
                  <button onClick={() => onEdit(e)} className="text-nebula-accent hover:text-blue-600 transition-colors p-1"><Pencil size={18}/></button>
                  <button onClick={() => onDelete(e.id)} className="text-red-400/30 hover:text-red-400 transition-colors p-1"><Trash2 size={18}/></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsFeature({ t, currentLang, setLang, theme, setTheme, allData, addToast }: any) {
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    addToast(t.saved);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="bg-nebula-surface rounded-2xl p-6 card-shadow border border-nebula-border">
        <div className="flex items-center gap-2 mb-6 text-nebula-accent uppercase font-black tracking-tighter">
          <Settings size={24} />
          <h2 className="text-lg">{t.settingsTitle}</h2>
        </div>
        
        <div className="space-y-6 text-nebula-text-primary">
          <div className="flex items-center justify-between p-3 bg-nebula-deep rounded-xl border border-nebula-border">
             <div className="flex items-center gap-3">
               <Languages size={20} className="text-nebula-text-secondary" />
               <span className="font-black text-xs text-nebula-text-secondary uppercase tracking-widest">{t.settingsLanguageLabel}</span>
             </div>
             <div className="flex gap-2">
               <button onClick={() => setLang('hi')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${currentLang === 'hi' ? 'bg-nebula-accent text-white shadow-md scale-105' : 'bg-nebula-deep text-nebula-text-secondary border border-nebula-border'}`}>हिंदी</button>
               <button onClick={() => setLang('en')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${currentLang === 'en' ? 'bg-nebula-accent text-white shadow-md scale-105' : 'bg-nebula-deep text-nebula-text-secondary border border-nebula-border'}`}>EN</button>
             </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-nebula-deep rounded-xl border border-nebula-border">
             <div className="flex items-center gap-3">
               {theme === 'dark' ? <Info size={20} className="text-nebula-text-secondary" /> : <Info size={20} className="text-nebula-text-secondary" />}
               <span className="font-black text-xs text-nebula-text-secondary uppercase tracking-widest">{t.theme}</span>
             </div>
             <div className="flex gap-2">
               <button onClick={() => setTheme('dark')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${theme === 'dark' ? 'bg-nebula-accent text-white shadow-md scale-105' : 'bg-nebula-deep text-nebula-text-secondary border border-nebula-border'}`}>{t.dark}</button>
               <button onClick={() => setTheme('light')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${theme === 'light' ? 'bg-nebula-accent text-white shadow-md scale-105' : 'bg-nebula-deep text-nebula-text-secondary border border-nebula-border'}`}>{t.light}</button>
             </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-nebula-deep rounded-xl border border-nebula-border">
             <div className="flex items-center gap-3">
               <Download size={20} className="text-nebula-text-secondary" />
               <span className="font-black text-xs text-nebula-text-secondary uppercase tracking-widest whitespace-nowrap">{t.export}</span>
             </div>
             <button onClick={handleExport} className="px-5 py-2 bg-nebula-surface border border-nebula-accent text-nebula-accent rounded-full text-xs font-black uppercase tracking-widest hover:bg-nebula-accent hover:text-white transition-all active:scale-95">
                DOWNLOAD JSON
             </button>
          </div>
        </div>
      </div>

       <div className="bg-nebula-surface rounded-2xl p-6 card-shadow border border-nebula-border mb-20 text-center">
         <Info size={32} className="mx-auto text-nebula-border mb-3" />
         <h4 className="text-xs font-black uppercase text-nebula-text-secondary mb-2 tracking-tighter tracking-widest">{t.about} • v2.0</h4>
         <p className="text-xs font-medium text-nebula-text-secondary uppercase tracking-tighter leading-relaxed">
           {t.infoText}
         </p>
       </div>
    </motion.div>
  );
}

// --- Common UI Components ---
function Input({ label, type, value, onChange, placeholder }: any) {
  return (
    <div>
      <label className="block text-xs font-black text-nebula-text-secondary mb-1 uppercase tracking-widest">{label}</label>
      <input 
        type={type} 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        placeholder={placeholder}
        className="nebula-input w-full p-3 text-sm font-bold tracking-tight focus:ring-2 focus:ring-nebula-accent/20"
      />
    </div>
  );
}

function OtherFeature({ t, entries, setEntries, addToast }: any) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('other');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const filteredEntries = useMemo(() => {
    return entries.filter((e: any) => 
      e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.date.includes(searchTerm) ||
      (t[`cat${e.category.charAt(0).toUpperCase() + e.category.slice(1)}` as keyof typeof t] || e.category).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [entries, searchTerm, t]);

  const displayedEntries = showAll ? filteredEntries : filteredEntries.slice(0, 10);

  const handleSave = () => {
    if (!amount) { addToast(t.fillAllFields, 'error'); return; }
    
    if (editingId) {
      setEntries(entries.map((e: any) => e.id === editingId ? {
        ...e, date, category, amount: parseFloat(amount), note
      } : e).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setEditingId(null);
      addToast(t.saved);
    } else {
      const entry = { id: Date.now(), date, category, amount: parseFloat(amount), note };
      setEntries([entry, ...entries].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      addToast(t.saved);
    }
    setAmount(''); setNote('');
  };

  const startEdit = (e: any) => {
    setEditingId(e.id);
    setDate(e.date);
    setCategory(e.category);
    setAmount(e.amount.toString());
    setNote(e.note || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
       <div className="bg-nebula-surface rounded-2xl p-6 card-shadow border border-nebula-border mb-6">
        <div className="flex items-center gap-2 mb-6 text-purple-400 font-bold uppercase tracking-wider">
          <div className="p-2 bg-purple-900/40 rounded-lg">📝</div>
          <h2 className="text-lg font-extrabold tracking-tight text-nebula-text-primary uppercase">{t.otherCardTitle}</h2>
        </div>
        <div className="space-y-4">
          <Input label="DATE" type="date" value={date} onChange={setDate} />
          <div>
            <label className="block text-xs font-black text-nebula-text-secondary mb-1 uppercase tracking-widest tracking-tighter">CATEGORY</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 bg-nebula-deep border border-nebula-border text-nebula-text-primary rounded-xl text-sm font-bold outline-none">
               <option value="bills">{t.catBills.toUpperCase()}</option>
               <option value="groceries">{t.catGroceries.toUpperCase()}</option>
               <option value="entertainment">{t.catEntertainment.toUpperCase()}</option>
               <option value="medical">{t.catMedical.toUpperCase()}</option>
               <option value="travel">{t.catTravel.toUpperCase()}</option>
               <option value="other">{t.catOther.toUpperCase()}</option>
            </select>
          </div>
          <Input label="AMOUNT (₹)" type="number" value={amount} onChange={setAmount} placeholder="0" />
          <Input label="NOTE" type="text" value={note} onChange={setNote} placeholder="Details..." />
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex-1 gradient-bg text-white p-4 rounded-xl font-black tracking-widest uppercase shadow-xl active:scale-95 transition-transform">
              {editingId ? 'UPDATE' : 'SAVE'}
            </button>
            {editingId && (
              <button 
                onClick={() => { setEditingId(null); setAmount(''); setNote(''); }}
                className="px-4 bg-nebula-deep border border-nebula-border text-nebula-text-secondary rounded-xl uppercase text-[10px] font-black"
              >
                CANCEL
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="bg-nebula-surface rounded-2xl p-4 card-shadow border border-nebula-border mb-8">
        <div className="flex items-center justify-between mb-4 border-l-4 border-nebula-accent pl-3">
          <h3 className="text-xs font-black text-nebula-text-secondary uppercase tracking-widest">{t.otherHistoryTitle}</h3>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              placeholder="Search..." 
              className="bg-nebula-deep border border-nebula-border rounded-lg px-2 py-1 text-[10px] text-nebula-text-primary outline-none focus:border-nebula-accent w-24"
            />
          </div>
        </div>
        <div className="space-y-3">
          {displayedEntries.length === 0 ? <p className="text-center text-nebula-text-secondary py-6 font-black text-[10px] uppercase">{t.noEntries}</p> : displayedEntries.map((e: any) => (
            <div key={e.id} className="flex items-center justify-between p-3 bg-nebula-deep rounded-xl border border-nebula-border">
              <div className="flex-1">
                <p className="text-[9px] font-black text-nebula-text-secondary uppercase whitespace-nowrap tracking-tighter">{e.date}</p>
                <p className="text-xs font-bold text-nebula-text-primary uppercase tracking-tight">📝 {t[`cat${e.category.charAt(0).toUpperCase() + e.category.slice(1)}` as keyof typeof t] || e.category}</p>
                {e.note && <p className="text-xs text-nebula-text-secondary font-medium tracking-tighter">{e.note}</p>}
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-black text-nebula-text-primary tracking-tighter font-mono">₹{e.amount.toFixed(2)}</p>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(e)} className="text-nebula-accent hover:text-blue-600 transition-colors p-1"><Pencil size={18}/></button>
                  <button onClick={() => { setEntries((prev: any) => prev.filter((en:any) => en.id !== e.id)); addToast(t.deleted); }} className="text-red-400 hover:text-red-600 transition-colors p-1"><Trash2 size={18}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filteredEntries.length > 10 && (
          <button 
            onClick={() => setShowAll(!showAll)}
            className="w-full mt-4 py-2 border border-dashed border-nebula-border rounded-xl text-[10px] font-black text-nebula-text-secondary hover:bg-nebula-deep transition-colors uppercase tracking-widest"
          >
            {showAll ? 'SHOW LESS' : `ALL HISTORY (${filteredEntries.length})`}
          </button>
        )}
      </div>
    </motion.div>
  );
}

function GasFeature({ t, entries, setEntries, addToast }: any) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [agency, setAgency] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const filteredEntries = useMemo(() => {
    return entries.filter((e: any) => 
      e.agency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.date.includes(searchTerm)
    );
  }, [entries, searchTerm]);

  const displayedEntries = showAll ? filteredEntries : filteredEntries.slice(0, 10);

  const handleSave = () => {
    if (!agency || !amount) { addToast(t.fillAllFields, 'error'); return; }
    if (editingId) {
      setEntries(entries.map((e: any) => e.id === editingId ? { ...e, date, agency, amount: parseFloat(amount), note } : e).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setEditingId(null);
      addToast(t.saved);
    } else {
      const entry = { id: Date.now(), date, agency, amount: parseFloat(amount), note };
      setEntries([entry, ...entries].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      addToast(t.saved);
    }
    setAgency(''); setAmount(''); setNote('');
  };

  const startEdit = (e: any) => {
    setEditingId(e.id); setDate(e.date); setAgency(e.agency); setAmount(e.amount.toString()); setNote(e.note);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="bg-nebula-surface rounded-2xl p-6 card-shadow border border-nebula-border mb-6 text-nebula-text-primary">
        <div className="flex items-center gap-2 mb-6 text-red-400 font-bold uppercase tracking-wider">
          <div className="p-2 bg-red-900/40 rounded-lg">🔥</div>
          <h2 className="text-lg font-extrabold tracking-tight uppercase">{t.gasCardTitle}</h2>
        </div>
        <div className="space-y-4">
          <Input label="DATE" type="date" value={date} onChange={setDate} />
          <Input label={t.gasAgency} type="text" value={agency} onChange={setAgency} placeholder="Agency name..." />
          <Input label="AMOUNT (₹)" type="number" value={amount} onChange={setAmount} placeholder="0" />
          <Input label="NOTE" type="text" value={note} onChange={setNote} placeholder="Extra details..." />
          <button onClick={handleSave} className="w-full gradient-bg text-white p-4 rounded-xl font-black tracking-widest uppercase shadow-xl active:scale-95 transition-transform">
            {editingId ? 'UPDATE' : 'SAVE'}
          </button>
        </div>
      </div>
      <div className="bg-nebula-surface rounded-2xl p-4 card-shadow border border-nebula-border mb-8">
        <div className="flex items-center justify-between mb-4 border-l-4 border-nebula-accent pl-3">
          <h3 className="text-xs font-black text-nebula-text-secondary uppercase tracking-widest">GAS HISTORY</h3>
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search..." className="bg-nebula-deep border border-nebula-border rounded-lg px-2 py-1 text-[10px] text-nebula-text-primary outline-none focus:border-nebula-accent w-24" />
        </div>
        <div className="space-y-3">
          {displayedEntries.map((e: any) => (
            <div key={e.id} className="flex justify-between items-center p-3 bg-nebula-deep rounded-xl border border-nebula-border">
              <div>
                <p className="text-[10px] text-nebula-text-secondary font-black uppercase">{e.date}</p>
                <p className="text-xs font-bold uppercase">{e.agency}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-sm font-black font-mono">₹{e.amount.toFixed(2)}</p>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(e)} className="text-nebula-accent"><Pencil size={18}/></button>
                  <button onClick={() => setEntries(entries.filter((x:any) => x.id !== e.id))} className="text-red-400"><Trash2 size={18}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function SchoolFeature({ t, entries, setEntries, addToast }: any) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const filteredEntries = useMemo(() => entries.filter((e: any) => e.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || e.date.includes(searchTerm)), [entries, searchTerm]);
  const displayedEntries = showAll ? filteredEntries : filteredEntries.slice(0, 10);

  const handleSave = () => {
    if (!studentName || !amount) { addToast(t.fillAllFields, 'error'); return; }
    if (editingId) {
      setEntries(entries.map((e: any) => e.id === editingId ? { ...e, date, studentName, studentClass, amount: parseFloat(amount), note } : e).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setEditingId(null); addToast(t.saved);
    } else {
      const entry = { id: Date.now(), date, studentName, studentClass, amount: parseFloat(amount), note };
      setEntries([entry, ...entries].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      addToast(t.saved);
    }
    setStudentName(''); setStudentClass(''); setAmount(''); setNote('');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="bg-nebula-surface rounded-2xl p-6 card-shadow border border-nebula-border mb-6 text-nebula-text-primary">
        <div className="flex items-center gap-2 mb-6 text-indigo-400 font-bold uppercase tracking-wider">
          <div className="p-2 bg-indigo-900/40 rounded-lg">🎓</div>
          <h2 className="text-lg font-extrabold tracking-tight uppercase">{t.schoolCardTitle}</h2>
        </div>
        <div className="space-y-4">
          <Input label="DATE" type="date" value={date} onChange={setDate} />
          <Input label={t.studentName} type="text" value={studentName} onChange={setStudentName} />
          <Input label={t.studentClass} type="text" value={studentClass} onChange={setStudentClass} />
          <Input label="AMOUNT (₹)" type="number" value={amount} onChange={setAmount} />
          <button onClick={handleSave} className="w-full gradient-bg text-white p-4 rounded-xl font-black tracking-widest uppercase shadow-xl active:scale-95 transition-transform">
            {editingId ? 'UPDATE' : 'SAVE'}
          </button>
        </div>
      </div>
      <div className="bg-nebula-surface rounded-2xl p-4 card-shadow border border-nebula-border mb-8 overflow-hidden">
        <h3 className="text-xs font-black text-nebula-text-secondary mb-4 border-l-4 border-nebula-accent pl-3 uppercase tracking-widest">FEES HISTORY</h3>
        <div className="space-y-3">
          {displayedEntries.map((e: any) => (
            <div key={e.id} className="flex justify-between items-center p-3 bg-nebula-deep rounded-xl border border-nebula-border">
              <div>
                <p className="text-[10px] text-nebula-text-secondary font-black">{e.date}</p>
                <p className="text-xs font-bold uppercase">{e.studentName} ({e.studentClass})</p>
              </div>
              <p className="text-sm font-black font-mono">₹{e.amount.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function PetFeature({ t, entries, setEntries, addToast }: any) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [petName, setPetName] = useState('');
  const [type, setType] = useState('Vaccine');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleSave = () => {
    if (!petName || !amount) { addToast(t.fillAllFields, 'error'); return; }
    if (editingId) {
      setEntries(entries.map((e: any) => e.id === editingId ? { ...e, date, petName, type, amount: parseFloat(amount), note } : e).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setEditingId(null); addToast(t.saved);
    } else {
      const entry = { id: Date.now(), date, petName, type, amount: parseFloat(amount), note };
      setEntries([entry, ...entries].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      addToast(t.saved);
    }
    setPetName(''); setAmount(''); setNote('');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="bg-nebula-surface rounded-2xl p-6 card-shadow border border-nebula-border mb-6 text-nebula-text-primary">
        <div className="flex items-center gap-2 mb-6 text-yellow-400 font-bold uppercase tracking-wider">
          <div className="p-2 bg-yellow-900/40 rounded-lg">🐕</div>
          <h2 className="text-lg font-extrabold tracking-tight uppercase">{t.petCardTitle}</h2>
        </div>
        <div className="space-y-4">
          <Input label="DATE" type="date" value={date} onChange={setDate} />
          <Input label={t.petName} type="text" value={petName} onChange={setPetName} />
          <Input label={t.petExpenseType} type="text" value={type} onChange={setType} placeholder="Vaccine/Food..." />
          <Input label="AMOUNT (₹)" type="number" value={amount} onChange={setAmount} />
          <button onClick={handleSave} className="w-full gradient-bg text-white p-4 rounded-xl font-black tracking-widest uppercase shadow-xl active:scale-95 transition-transform">
            {editingId ? 'UPDATE' : 'SAVE'}
          </button>
        </div>
      </div>
      <div className="bg-nebula-surface rounded-2xl p-4 card-shadow border border-nebula-border mb-20 overflow-hidden">
        <h3 className="text-xs font-black text-nebula-text-secondary mb-4 border-l-4 border-nebula-accent pl-3 uppercase tracking-widest">PET CARE HISTORY</h3>
        <div className="space-y-3">
          {entries.map((e: any) => (
            <div key={e.id} className="flex justify-between items-center p-3 bg-nebula-deep rounded-xl border border-nebula-border">
              <div>
                <p className="text-[10px] text-nebula-text-secondary font-black">{e.date}</p>
                <p className="text-xs font-bold uppercase">{e.petName} • {e.type}</p>
              </div>
              <p className="text-sm font-black font-mono">₹{e.amount.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ReportsFeature({ t, data }: any) {
  const [start, setStart] = useState(new Date(new Date().setDate(1)).toISOString().split('T')[0]);
  const [end, setEnd] = useState(new Date().toISOString().split('T')[0]);

  const stats = useMemo(() => {
    const milk = data.milkEntries.filter((e:any) => e.date >= start && e.date <= end).reduce((s:number, e:any) => s + e.cost, 0);
    const fuel = data.fuelEntries.filter((e:any) => e.date >= start && e.date <= end).reduce((s:number, e:any) => s + e.cost, 0);
    const veg = data.vegEntries.filter((e:any) => e.date >= start && e.date <= end).reduce((s:number, e:any) => s + e.amount, 0);
    const gas = data.gasEntries.filter((e:any) => e.date >= start && e.date <= end).reduce((s:number, e:any) => s + e.amount, 0);
    const school = data.schoolEntries.filter((e:any) => e.date >= start && e.date <= end).reduce((s:number, e:any) => s + e.amount, 0);
    const pets = data.petEntries.filter((e:any) => e.date >= start && e.date <= end).reduce((s:number, e:any) => s + e.amount, 0);
    const other = data.otherEntries.filter((e:any) => e.date >= start && e.date <= end).reduce((s:number, e:any) => s + e.amount, 0);
    const loanG = data.loanEntries.filter((e:any) => !e.settled && e.type === 'given' && e.date >= start && e.date <= end).reduce((s:number, e:any) => s + e.amount, 0);
    const loanT = data.loanEntries.filter((e:any) => !e.settled && e.type === 'taken' && e.date >= start && e.date <= end).reduce((s:number, e:any) => s + e.amount, 0);
    
    return { milk, fuel, veg, gas, school, pets, other, loanG, loanT, total: milk + fuel + veg + gas + school + pets + other };
  }, [data, start, end]);

  const chartData = useMemo(() => [
    { name: t.milk, value: stats.milk, color: '#3b82f6' },
    { name: t.fuel, value: stats.fuel, color: '#f97316' },
    { name: t.veg, value: stats.veg, color: '#22c55e' },
    { name: t.gas, value: stats.gas, color: '#ef4444' },
    { name: t.school, value: stats.school, color: '#6366f1' },
    { name: t.pets, value: stats.pets, color: '#eab308' },
    { name: t.other, value: stats.other, color: '#a855f7' },
  ].filter(d => d.value > 0), [stats, t]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-nebula-surface border border-nebula-border p-2 rounded-lg shadow-xl">
          <p className="text-xs font-black uppercase text-nebula-text-secondary mb-1">
            {payload[0].name}
          </p>
          <p className="text-sm font-black tracking-tighter text-nebula-text-primary">
            ₹{payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
       <div className="bg-nebula-surface rounded-2xl p-6 card-shadow border border-nebula-border mb-6">
        <h2 className="text-lg font-black uppercase tracking-tighter mb-4 text-nebula-accent">{t.customRange}</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
           <Input label="FROM" type="date" value={start} onChange={setStart} />
           <Input label="TO" type="date" value={end} onChange={setEnd} />
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
           <button onClick={() => {
             const d = new Date();
             setStart(d.toISOString().split('T')[0]);
             setEnd(d.toISOString().split('T')[0]);
           }} className="bg-nebula-deep text-nebula-text-secondary p-2 rounded-lg text-xs font-bold uppercase tracking-wider border border-nebula-border hover:bg-nebula-border transition-colors">{t.today}</button>
           <button onClick={() => {
              const d = new Date();
              d.setDate(d.getDate() - 7);
              setStart(d.toISOString().split('T')[0]);
              setEnd(new Date().toISOString().split('T')[0]);
           }} className="bg-nebula-deep text-nebula-text-secondary p-2 rounded-lg text-xs font-bold uppercase tracking-wider border border-nebula-border hover:bg-nebula-border transition-colors">{t.week}</button>
           <button onClick={() => {
              const d = new Date();
              d.setDate(1);
              setStart(d.toISOString().split('T')[0]);
              setEnd(new Date().toISOString().split('T')[0]);
           }} className="bg-nebula-deep text-nebula-text-secondary p-2 rounded-lg text-xs font-bold uppercase tracking-wider border border-nebula-border hover:bg-nebula-border transition-colors">{t.month}</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="gradient-bg p-5 rounded-2xl text-white card-shadow col-span-2">
           <p className="text-blue-100/70 text-xs font-black uppercase tracking-widest mb-1 opacity-70">{t.total}</p>
           <p className="text-3xl font-black tracking-tighter font-mono">₹{stats.total.toFixed(2)}</p>
        </div>
        <ReportStat label={t.milk} value={stats.milk} emoji="🥛" />
        <ReportStat label={t.fuel} value={stats.fuel} emoji="⛽" />
        <ReportStat label={t.veg} value={stats.veg} emoji="🥬" />
        <ReportStat label={t.gas} value={stats.gas} emoji="🔥" />
        <ReportStat label={t.school} value={stats.school} emoji="🎓" />
        <ReportStat label={t.pets} value={stats.pets} emoji="🐕" />
        <ReportStat label={t.other} value={stats.other} emoji="📝" />
        <ReportStat label={t.loanGiven} value={stats.loanG} emoji="💰" color="text-pink-400" />
        <ReportStat label={t.loanTaken} value={stats.loanT} emoji="🤝" color="text-blue-400" />
      </div>

      {chartData.length > 0 && (
        <div className="space-y-6 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Pie Chart Card */}
          <div className="bg-nebula-surface rounded-2xl p-4 card-shadow border border-nebula-border">
            <h3 className="text-xs font-black text-nebula-text-secondary mb-6 border-l-4 border-nebula-accent pl-3 uppercase tracking-widest">Breakdown (Pie)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    formatter={(value) => <span className="text-xs font-black uppercase text-nebula-text-secondary px-2">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart Card */}
          <div className="bg-nebula-surface rounded-2xl p-4 card-shadow border border-nebula-border">
            <h3 className="text-xs font-black text-nebula-text-secondary mb-6 border-l-4 border-nebula-accent pl-3 uppercase tracking-widest">Breakdown (Bar)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} 
                  />
                  <YAxis 
                    hide 
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                  <Bar 
                    dataKey="value" 
                    radius={[10, 10, 0, 0]}
                    barSize={40}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function ReportStat({ label, value, emoji, color }: any) {
  return (
    <div className="bg-nebula-surface p-4 rounded-2xl border border-nebula-border card-shadow font-mono">
      <p className="text-nebula-text-secondary text-[9px] font-black uppercase mb-1 flex items-center gap-1 opacity-70 tracking-widest">{emoji} {label}</p>
      <p className={`text-lg font-black tracking-tighter ${color || 'text-nebula-accent'}`}>₹{value.toFixed(2)}</p>
    </div>
  );
}
