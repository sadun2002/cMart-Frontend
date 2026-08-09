'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Shield, KeyRound, UserCircle, Mail, Phone, Calendar, Briefcase, ChevronDown, Check, CreditCard, FileText, Settings, Upload, Save } from 'lucide-react';
import { DEFAULT_ROLES } from '@/lib/roles';
import { toast } from 'sonner';

interface AddEmployeePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  isSubmitting: boolean;
}

const TABS = [
  { id: 'personal', label: 'Personal', icon: UserCircle },
  { id: 'contact', label: 'Contact', icon: Phone },
  { id: 'employment', label: 'Employment', icon: Briefcase },
  { id: 'payroll', label: 'Payroll & Bank', icon: CreditCard },
  { id: 'education', label: 'Education', icon: FileText },
  { id: 'documents', label: 'Documents', icon: Upload },
  { id: 'security', label: 'Security', icon: Shield },
];

export function AddEmployeePanel({ isOpen, onClose, onSave, isSubmitting }: AddEmployeePanelProps) {
  const [activeTab, setActiveTab] = useState('personal');

  // Form State
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    gender: '',
    dob: '',
    maritalStatus: '',
    nationality: '',
    nic: '',
    passport: '',
    // Contact Details
    phone: '',
    email: '',
    permanentAddress: '',
    currentAddress: '',
    city: '',
    province: '',
    country: '',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
    emergencyContactAltPhone: '',
    emergencyContactAddress: '',
    // Employment
    roleId: '',
    employmentType: '',
    joinDate: '',
    probationEndDate: '',
    employeeStatus: 'active',
    shift: '',
    workLocation: '',
    employeeCode: '',
    fingerprintId: '',
    rfidCard: '',
    faceId: '',
    weeklyOffDay: '',
    // Payroll & Bank
    basicSalary: '',
    paymentMethod: '',
    salaryFrequency: '',
    bankName: '',
    accountHolderName: '',
    branchName: '',
    accountNumber: '',
    epfNumber: '',
    etfNumber: '',
    taxNumber: '',
    // Education & Experience
    highestQualification: '',
    institute: '',
    fieldOfStudy: '',
    yearCompleted: '',
    gradeGpa: '',
    prevCompany: '',
    prevPosition: '',
    prevStartDate: '',
    prevEndDate: '',
    yearsExperience: '',
    reasonForLeaving: '',
    languages: '',
    skills: '',
    certifications: '',
    notes: '',
    // System Access
    allowPosLogin: false,
    username: '',
    password: '',
    confirmPassword: '',
    enable2FA: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.allowPosLogin) {
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }
    
    // Convert to the API expected format (combine first/last name, etc.)
    const submitData = {
      ...formData,
      name: `${formData.firstName} ${formData.lastName}`.trim() || 'New Employee',
    };
    
    await onSave(submitData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200]"
          />
          
          <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-4xl bg-white dark:bg-slate-900 shadow-2xl z-[210] border-l border-slate-200 dark:border-slate-800 flex flex-col"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="w-6 h-6 text-blue-600" />
                  Add New Employee
                </h2>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Complete the profile setup to onboard a new staff member.</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TAB NAVIGATION */}
            <div className="px-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0 overflow-x-auto no-scrollbar">
              <div className="flex gap-2 py-3 min-w-max">
                {TABS.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                        isActive 
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20' 
                          : 'text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FORM CONTENT */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white dark:bg-slate-900 relative">
              <form id="fullEmployeeForm" onSubmit={handleSubmit} className="space-y-6 pb-20">
                
                {/* 1. PERSONAL INFO */}
                <div className={activeTab === 'personal' ? 'block' : 'hidden'}>
                  <div className="mb-6 flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors cursor-pointer group">
                      <Upload className="w-6 h-6 mb-1" />
                      <span className="text-[10px] font-bold uppercase">Upload Photo</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">First Name *</label>
                      <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Last Name *</label>
                      <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Gender</label>
                      <select name="gender" value={formData.gender} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none">
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Date of Birth</label>
                      <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Marital Status</label>
                      <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none">
                        <option value="">Select Status</option>
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="divorced">Divorced</option>
                        <option value="widowed">Widowed</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nationality</label>
                      <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">National ID Card (NIC) *</label>
                      <input type="text" name="nic" required value={formData.nic} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Passport Number</label>
                      <input type="text" name="passport" value={formData.passport} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                    </div>
                  </div>
                </div>

                {/* 2. CONTACT DETAILS */}
                <div className={activeTab === 'contact' ? 'block' : 'hidden'}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mobile Number *</label>
                      <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address *</label>
                      <input type="email" name="email" required value={formData.email} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                    </div>
                    <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Current Address</label>
                        <textarea rows={2} name="currentAddress" value={formData.currentAddress} onChange={handleChange} className="mt-1.5 w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none resize-none" />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Permanent Address</label>
                        <textarea rows={2} name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} className="mt-1.5 w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none resize-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">City</label>
                      <input type="text" name="city" value={formData.city} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Province / State</label>
                      <input type="text" name="province" value={formData.province} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Country</label>
                      <input type="text" name="country" value={formData.country} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-lg border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">Emergency Contact</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Contact Name *</label>
                      <input type="text" name="emergencyContactName" required value={formData.emergencyContactName} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Relationship *</label>
                      <input type="text" name="emergencyContactRelation" required value={formData.emergencyContactRelation} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Phone Number *</label>
                      <input type="tel" name="emergencyContactPhone" required value={formData.emergencyContactPhone} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Alternate Phone</label>
                      <input type="tel" name="emergencyContactAltPhone" value={formData.emergencyContactAltPhone} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Emergency Contact Address</label>
                      <input type="text" name="emergencyContactAddress" value={formData.emergencyContactAddress} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                    </div>
                  </div>
                </div>

                {/* 3. EMPLOYMENT */}
                <div className={activeTab === 'employment' ? 'block' : 'hidden'}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Job Role / Position *</label>
                      <select name="roleId" required value={formData.roleId} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none">
                        <option value="" disabled>Select Role</option>
                        {DEFAULT_ROLES.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Employment Type *</label>
                      <select name="employmentType" required value={formData.employmentType} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none">
                        <option value="">Select Type</option>
                        <option value="full_time">Full Time</option>
                        <option value="part_time">Part Time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Join Date *</label>
                      <input type="date" name="joinDate" required value={formData.joinDate} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Probation End Date</label>
                      <input type="date" name="probationEndDate" value={formData.probationEndDate} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Employee Status</label>
                      <select name="employeeStatus" value={formData.employeeStatus} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Work Location</label>
                      <input type="text" name="workLocation" value={formData.workLocation} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-lg border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">Attendance & Identification</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Employee Code</label>
                      <input type="text" name="employeeCode" value={formData.employeeCode} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Default Shift</label>
                      <select name="shift" value={formData.shift} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none">
                        <option value="">Select Shift</option>
                        <option value="morning">Morning Shift</option>
                        <option value="evening">Evening Shift</option>
                        <option value="night">Night Shift</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Fingerprint ID</label>
                      <input type="text" name="fingerprintId" value={formData.fingerprintId} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">RFID Card Number</label>
                      <input type="text" name="rfidCard" value={formData.rfidCard} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Face Recognition ID</label>
                      <input type="text" name="faceId" value={formData.faceId} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Weekly Off Day</label>
                      <select name="weeklyOffDay" value={formData.weeklyOffDay} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none">
                        <option value="">Select Day</option>
                        <option value="sunday">Sunday</option>
                        <option value="monday">Monday</option>
                        <option value="tuesday">Tuesday</option>
                        <option value="wednesday">Wednesday</option>
                        <option value="thursday">Thursday</option>
                        <option value="friday">Friday</option>
                        <option value="saturday">Saturday</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 4. PAYROLL & BANK */}
                <div className={activeTab === 'payroll' ? 'block' : 'hidden'}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Basic Salary</label>
                      <input type="number" step="0.01" name="basicSalary" value={formData.basicSalary} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" placeholder="0.00" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Payment Frequency</label>
                      <select name="salaryFrequency" value={formData.salaryFrequency} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none">
                        <option value="monthly">Monthly</option>
                        <option value="weekly">Weekly</option>
                        <option value="daily">Daily</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Payment Method</label>
                      <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none">
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="cash">Cash</option>
                        <option value="check">Check</option>
                      </select>
                    </div>
                  </div>

                  {formData.paymentMethod === 'bank_transfer' && (
                    <>
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">Bank Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                        <div>
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Bank Name</label>
                          <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Branch Name</label>
                          <input type="text" name="branchName" value={formData.branchName} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Account Holder Name</label>
                          <input type="text" name="accountHolderName" value={formData.accountHolderName} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Account Number</label>
                          <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                        </div>
                      </div>
                    </>
                  )}

                  <h3 className="font-bold text-slate-900 dark:text-white text-lg border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">Statutory Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">EPF Number</label>
                      <input type="text" name="epfNumber" value={formData.epfNumber} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">ETF Number</label>
                      <input type="text" name="etfNumber" value={formData.etfNumber} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tax / TIN Number</label>
                      <input type="text" name="taxNumber" value={formData.taxNumber} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                    </div>
                  </div>
                </div>

                {/* 5. EDUCATION & EXPERIENCE */}
                <div className={activeTab === 'education' ? 'block' : 'hidden'}>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">Highest Education</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Qualification</label>
                      <input type="text" name="highestQualification" value={formData.highestQualification} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" placeholder="e.g. BSc, HND, A/L" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Institute / University</label>
                      <input type="text" name="institute" value={formData.institute} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Field of Study</label>
                      <input type="text" name="fieldOfStudy" value={formData.fieldOfStudy} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Year Completed</label>
                        <input type="text" name="yearCompleted" value={formData.yearCompleted} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Grade / GPA</label>
                        <input type="text" name="gradeGpa" value={formData.gradeGpa} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                      </div>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-lg border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">Previous Experience</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Company Name</label>
                      <input type="text" name="prevCompany" value={formData.prevCompany} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Position Held</label>
                      <input type="text" name="prevPosition" value={formData.prevPosition} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Start Date</label>
                      <input type="date" name="prevStartDate" value={formData.prevStartDate} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">End Date</label>
                      <input type="date" name="prevEndDate" value={formData.prevEndDate} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Years of Experience</label>
                      <input type="text" name="yearsExperience" value={formData.yearsExperience} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Reason for Leaving</label>
                      <input type="text" name="reasonForLeaving" value={formData.reasonForLeaving} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-lg border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">Other Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Languages Known</label>
                      <input type="text" name="languages" value={formData.languages} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" placeholder="e.g. English, Sinhala, Tamil" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Key Skills</label>
                      <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Notes / Remarks</label>
                      <textarea rows={2} name="notes" value={formData.notes} onChange={handleChange} className="mt-1.5 w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none resize-none" />
                    </div>
                  </div>
                </div>

                {/* 6. DOCUMENTS */}
                <div className={activeTab === 'documents' ? 'block' : 'hidden'}>
                  <p className="text-sm text-slate-500 mb-6">Upload necessary HR and personal documents. (Mock UI)</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {['NIC Front', 'NIC Back', 'CV / Resume', 'Certificates', 'Appointment Letter', 'Employment Agreement', 'Driving License', 'Passport', 'Police Clearance', 'Medical Report'].map(doc => (
                      <div key={doc} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Upload className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 7. SYSTEM ACCESS & SECURITY */}
                <div className={activeTab === 'security' ? 'block' : 'hidden'}>
                  <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl p-5 mb-8">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input type="checkbox" name="allowPosLogin" checked={formData.allowPosLogin} onChange={handleChange} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">Allow System / POS Login</span>
                    </label>
                    <p className="text-xs text-slate-500 mt-2 ml-14">Enable this if the employee needs to log into the application.</p>
                  </div>

                  {formData.allowPosLogin && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Username / Login Email *</label>
                          <input type="text" name="username" required={formData.allowPosLogin} value={formData.username} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" />
                        </div>
                        <div className="hidden sm:block"></div>
                        
                        <div>
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Password *</label>
                          <input type="password" name="password" required={formData.allowPosLogin} minLength={6} value={formData.password} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" placeholder="••••••••" />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Confirm Password *</label>
                          <input type="password" name="confirmPassword" required={formData.allowPosLogin} minLength={6} value={formData.confirmPassword} onChange={handleChange} className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl outline-none" placeholder="••••••••" />
                        </div>
                      </div>

                      <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" name="enable2FA" checked={formData.enable2FA} onChange={handleChange} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">Enable Two-Factor Authentication (2FA)</span>
                            <span className="text-xs text-slate-500">Adds an extra layer of security requiring a code from an authenticator app.</span>
                          </div>
                        </label>
                      </div>

                    </motion.div>
                  )}
                  
                  <div className="mt-10 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-500 flex flex-col gap-2 font-medium">
                    <p className="flex items-center gap-2"><Settings className="w-4 h-4" /> System Generated Fields (Available after saving):</p>
                    <ul className="list-disc pl-8 space-y-1 mt-1 opacity-70">
                      <li>Created By: [Current User]</li>
                      <li>Created Date: [System Date]</li>
                      <li>Last Updated: [System Date]</li>
                      <li>Employment QR Code: Automatically generated for digital ID.</li>
                    </ul>
                  </div>
                </div>

              </form>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex gap-3 z-10">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="fullEmployeeForm"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" /> Save Employee Record
                  </>
                )}
              </button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
