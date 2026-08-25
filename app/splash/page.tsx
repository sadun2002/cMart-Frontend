'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { COMPANY_NAME, COMPANY_TAGLINE } from '@/lib/constants';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // Wait for the animation to finish (2.5 seconds)
    const timer = setTimeout(() => {
      // Check auth status from Zustand persist storage
      const authData = localStorage.getItem('cmart-auth');
      let token = null;
      let userRole = null;
      let userType = null;

      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          if (parsed?.state?.accessToken) {
            token = parsed.state.accessToken;
            userRole = parsed.state.user?.role;
            userType = parsed.state.user?.userType;
          }
        } catch (e) {
          console.error('Failed to parse auth data', e);
        }
      }

      if (token) {
        // Logged in
        if (userType === 'super_admin') {
          router.replace('/admin/dashboard');
        } else if (userRole === 'STORE_OWNER') {
          router.replace('/owner/dashboard');
        } else {
          router.replace('/employee/dashboard');
        }
      } else {
        // Not logged in
        router.replace('/login');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="fixed inset-0 bg-blue-600 flex flex-col items-center justify-center z-[9999] overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 w-[480px] h-[480px] bg-white/10 rounded-full blur-[120px] -translate-y-40 translate-x-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[380px] h-[380px] bg-blue-300/20 rounded-full blur-[100px] translate-y-40 -translate-x-20 pointer-events-none" />
        
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="font-sans flex flex-col items-center relative z-10"
      >
        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl mb-6">
          <span className="text-blue-700 font-black text-5xl">c</span>
        </div>
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-4xl font-black text-white tracking-tight"
        >
          {COMPANY_NAME}
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-blue-200 mt-3 font-medium text-lg"
        >
          {COMPANY_TAGLINE}
        </motion.p>
      </motion.div>
      
      {/* Loading Spinner */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="absolute bottom-16"
      >
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </motion.div>
    </div>
  );
}
