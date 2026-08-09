'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  ArrowRight,
  Heart,
  Zap,
  Globe,
  Coffee,
  Laptop,
  GraduationCap
} from 'lucide-react';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { COMPANY_NAME } from '@/lib/constants';

const BENEFITS = [
  {
    title: 'Remote First',
    description: 'Work from anywhere in the world. We care about what you do, not where you sit.',
    icon: Globe,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
  },
  {
    title: 'Health & Wellness',
    description: 'Comprehensive health, dental, and vision coverage for you and your family.',
    icon: Heart,
    color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400'
  },
  {
    title: 'Home Office Setup',
    description: 'Generous stipend to build your dream home office with the best equipment.',
    icon: Laptop,
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400'
  },
  {
    title: 'Continuous Learning',
    description: 'Annual budget for courses, conferences, and books to fuel your growth.',
    icon: GraduationCap,
    color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400'
  }
];

const OPEN_POSITIONS = [
  {
    department: 'Engineering',
    roles: [
      {
        title: 'Senior Frontend Engineer',
        location: 'Remote',
        type: 'Full-time',
      },
      {
        title: 'Backend Systems Engineer',
        location: 'Remote',
        type: 'Full-time',
      },
      {
        title: 'Engineering Manager',
        location: 'New York / Remote',
        type: 'Full-time',
      }
    ]
  },
  {
    department: 'Design',
    roles: [
      {
        title: 'Product Designer',
        location: 'Remote',
        type: 'Full-time',
      },
      {
        title: 'UX Researcher',
        location: 'London / Remote',
        type: 'Full-time',
      }
    ]
  },
  {
    department: 'Sales & Marketing',
    roles: [
      {
        title: 'Account Executive',
        location: 'Remote',
        type: 'Full-time',
      },
      {
        title: 'Content Marketing Manager',
        location: 'Remote',
        type: 'Full-time',
      }
    ]
  }
];

export default function CareersPage() {
  return (
    <div className="font-sans min-h-screen bg-white dark:bg-slate-950 transition-colors selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-50">
      <SiteHeader />

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-emerald-400/20 dark:bg-emerald-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000" />
      </div>

      <main className="relative z-10 pt-32 pb-24">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 mb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-bold mb-6 border border-blue-100 dark:border-blue-800/50">
              <Zap className="w-4 h-4" />
              <span>We're Hiring</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
              Build the future of <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                commerce with us
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join a team of passionate builders creating the world's most powerful and intuitive platform for modern businesses.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#open-roles" className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5">
                View Open Roles
              </a>
              <a href="#benefits" className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 hover:border-blue-600 dark:hover:border-blue-500 rounded-xl font-bold text-lg transition-all hover:-translate-y-0.5 shadow-sm">
                Learn About Benefits
              </a>
            </div>
          </motion.div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="max-w-7xl mx-auto px-6 mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">Why you'll love working here</h2>
            <p className="text-gray-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
              We believe in taking care of our team so they can focus on doing their best work.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {BENEFITS.map((benefit, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-gray-100 dark:border-slate-800 p-8 rounded-3xl hover:border-blue-100 dark:hover:border-blue-900/50 transition-colors shadow-sm"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${benefit.color}`}>
                  <benefit.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{benefit.title}</h3>
                <p className="text-gray-500 dark:text-slate-400 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Open Roles Section */}
        <section id="open-roles" className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">Open Positions</h2>
            <p className="text-gray-600 dark:text-slate-400 text-lg">
              Don't see a perfect fit? Send your resume to careers@{COMPANY_NAME.toLowerCase()}.com
            </p>
          </div>

          <div className="space-y-12">
            {OPEN_POSITIONS.map((dept, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-slate-800 pb-4">
                  {dept.department}
                </h3>
                <div className="space-y-4">
                  {dept.roles.map((role, roleIndex) => (
                    <Link 
                      key={roleIndex} 
                      href="#"
                      className="group block bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 rounded-2xl p-6 transition-all hover:shadow-lg hover:shadow-blue-100 dark:hover:shadow-none"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                            {role.title}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-slate-400 font-medium">
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4" /> {role.location}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" /> {role.type}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center text-blue-600 dark:text-blue-400 font-bold group-hover:translate-x-2 transition-transform">
                          Apply Now <ArrowRight className="w-5 h-5 ml-2" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
