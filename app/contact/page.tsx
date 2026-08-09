"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast, Toaster } from 'sonner';
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  MessageSquare,
  CheckCircle2,
  Loader2,
  Twitter,
  Linkedin,
  Github
} from 'lucide-react';
import { COMPANY_NAME, COMPANY_TAGLINE } from '@/lib/constants';
import { SmartNavbar } from '@/components/ui/smart-navbar';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { MotionBlurBackground } from '@/components/ui/motion-blur-background';

// Zod Form Schema
const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  company: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000, "Message is too long"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema)
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
    toast.success("Message sent successfully!");

    // Reset after showing success
    setTimeout(() => {
      setIsSuccess(false);
      reset();
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-gray-900 dark:text-white transition-colors relative">
      <MotionBlurBackground />

      {/* Navigation */}
      <SiteHeader />

      {/* HERO & SPLIT SECTION */}
      <div className="relative overflow-visible z-10">
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">

            {/* LEFT SIDE: Copy & Contact Info */}
            <div className="flex-1 lg:py-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold tracking-wide uppercase mb-8 transition-colors">
                <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></span>
                We are online
              </div>

              <h1 className="text-5xl lg:text-7xl font-black text-gray-900 dark:text-white tracking-tight mb-6 leading-tight transition-colors">
                Let's build <br />
                <span className="text-blue-600">
                  something great.
                </span>
              </h1>

              <p className="text-lg text-gray-600 dark:text-slate-300 mb-12 max-w-md leading-relaxed transition-colors">
                Whether you're looking to scale your store, need technical support, or want to explore partnership opportunities, our team is ready to help.
              </p>

              <div className="space-y-8">
                <div className="flex items-start gap-4 group cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 flex items-center justify-center shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-slate-700 transition-all">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 transition-colors">Chat with us</h3>
                    <p className="text-gray-500 dark:text-slate-400 text-sm mb-1 transition-colors">Our friendly team is here to help.</p>
                    <a href="mailto:hello@cmart.lk" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors">hello@cmart.lk</a>
                  </div>
                </div>

                <div className="flex items-start gap-4 group cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 dark:group-hover:bg-slate-700 transition-all">
                    <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 transition-colors">Visit us</h3>
                    <p className="text-gray-500 dark:text-slate-400 text-sm mb-1 transition-colors">Come say hello at our office HQ.</p>
                    <p className="text-gray-700 dark:text-slate-300 font-medium text-sm transition-colors">123 Main Street, Colombo 03, LK</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-slate-800 border border-purple-100 dark:border-slate-700 flex items-center justify-center shrink-0 group-hover:bg-purple-100 dark:group-hover:bg-slate-700 transition-all">
                    <Phone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 transition-colors">Call us</h3>
                    <p className="text-gray-500 dark:text-slate-400 text-sm mb-1 transition-colors">Mon-Fri from 9am to 6pm.</p>
                    <a href="tel:+94112345678" className="text-gray-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium text-sm transition-colors">+94 11 234 5678</a>
                  </div>
                </div>
              </div>

              {/* Socials */}
              <div className="mt-16 flex items-center gap-4">
                {/* Facebook */}
                <a href="#" className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-slate-700 transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </a>
                {/* Instagram */}
                <a href="#" className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-slate-700 transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                </a>
                {/* TikTok */}
                <a href="#" className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-slate-700 transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>
                </a>
                {/* WhatsApp */}
                <a href="#" className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-slate-700 transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a5.8 5.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
                </a>
              </div>
            </div>

            {/* RIGHT SIDE: The Form */}
            <div className="flex-1 w-full max-w-lg mx-auto lg:mx-0 relative lg:mt-8">
              <div className="relative bg-white dark:bg-slate-900/50 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-slate-800 transition-colors duration-300">
                {isSuccess ? (
                  <div className="h-[500px] flex flex-col items-center justify-center text-center animation-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 transition-colors">
                      <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Message Received!</h3>
                    <p className="text-gray-500 dark:text-slate-400 max-w-xs mx-auto transition-colors">
                      Thanks for reaching out. One of our experts will get back to you shortly.
                    </p>
                    <button
                      onClick={() => { setIsSuccess(false); reset(); }}
                      className="mt-8 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white transition-colors">Send a message</h3>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                      <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 transition-colors">First name</label>
                          <input
                            {...register("firstName")}
                            type="text"
                            placeholder="Jane"
                            className={`w-full px-4 py-3 bg-gray-50 dark:bg-slate-950/50 border ${errors.firstName ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 dark:focus:border-blue-500'} rounded-xl focus:outline-none focus:ring-4 transition-all text-sm text-gray-900 dark:text-white`}
                          />
                          {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 transition-colors">Last name</label>
                          <input
                            {...register("lastName")}
                            type="text"
                            placeholder="Smith"
                            className={`w-full px-4 py-3 bg-gray-50 dark:bg-slate-950/50 border ${errors.lastName ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 dark:focus:border-blue-500'} rounded-xl focus:outline-none focus:ring-4 transition-all text-sm text-gray-900 dark:text-white`}
                          />
                          {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 transition-colors">Email</label>
                        <input
                          {...register("email")}
                          type="email"
                          placeholder="jane@company.com"
                          className={`w-full px-4 py-3 bg-gray-50 dark:bg-slate-950/50 border ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 dark:focus:border-blue-500'} rounded-xl focus:outline-none focus:ring-4 transition-all text-sm text-gray-900 dark:text-white`}
                        />
                        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 transition-colors">Company <span className="text-gray-400 dark:text-slate-500 font-normal">(optional)</span></label>
                        <input
                          {...register("company")}
                          type="text"
                          placeholder="Acme Inc."
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950/50 border border-gray-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 dark:focus:border-blue-500 rounded-xl focus:outline-none focus:ring-4 transition-all text-sm text-gray-900 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 transition-colors">Message</label>
                        <textarea
                          {...register("message")}
                          rows={4}
                          placeholder="How can we help you?"
                          className={`w-full px-4 py-3 bg-gray-50 dark:bg-slate-950/50 border ${errors.message ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 dark:focus:border-blue-500'} rounded-xl focus:outline-none focus:ring-4 transition-all text-sm resize-none text-gray-900 dark:text-white`}
                        ></textarea>
                        {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 group"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            Send message
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MINIMALIST MAP SECTION */}
      <section className="relative z-10 bg-transparent border-t border-gray-100 dark:border-slate-800 transition-colors">
        <div className="w-full h-[400px] sm:h-[500px] relative overflow-hidden flex items-center justify-center">
          {/* Realistic Map Background */}
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-500 opacity-60 dark:opacity-30 dark:mix-blend-screen mix-blend-multiply"
            style={{ backgroundImage: "url('/map-bg.png')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-transparent dark:from-slate-950 pointer-events-none" />

          {/* Interactive Marker */}
          <div className="relative z-10 group cursor-pointer">
            <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20 w-16 h-16 -ml-4 -mt-4 pointer-events-none"></div>
            <div className="w-8 h-8 bg-blue-600 rounded-full shadow-lg shadow-blue-600/30 border-4 border-white dark:border-slate-900 flex items-center justify-center transform transition-transform group-hover:scale-110"></div>

            {/* Tooltip Card */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-gray-900 dark:bg-white text-white dark:text-slate-900 text-sm rounded-xl py-3 px-5 shadow-2xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none whitespace-nowrap flex flex-col items-center">
              <span className="font-semibold mb-0.5">cMart HQ</span>
              <span className="text-gray-300 dark:text-slate-500 text-xs transition-colors">Colombo 03, Sri Lanka</span>
              {/* Arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900 dark:border-t-white"></div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 px-6 relative z-10 bg-transparent border-t border-gray-100 dark:border-slate-800 transition-colors">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-4 transition-colors">Frequently asked questions</h2>
            <p className="text-gray-500 dark:text-slate-400 text-lg transition-colors">Can't find what you're looking for? Reach out to our customer support team.</p>
          </div>

          <div className="space-y-8">
            {[
              {
                q: "What are your support hours?",
                a: "Our standard support hours are Monday through Friday, 9:00 AM to 6:00 PM (IST). Enterprise customers receive 24/7 dedicated support coverage."
              },
              {
                q: "How quickly do you respond to support requests?",
                a: "We aim to respond to all inquiries within 2 hours during business hours. For complex technical issues, resolution times may vary, but we'll keep you updated every step of the way."
              },
              {
                q: "Can I schedule a platform demo?",
                a: "Absolutely! Just fill out the contact form above, mention you'd like a demo in your message, and one of our product specialists will reach out to schedule a convenient time."
              },
              {
                q: "Do you offer custom integrations?",
                a: "Yes, our platform is API-first. We can help you integrate with your existing ERP, accounting software, or legacy systems. Contact our sales team to discuss your specific requirements."
              }
            ].map((faq, i) => (
              <div key={i} className="group bg-white dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 p-8 rounded-3xl transition-colors">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-3 transition-colors">
                  <MessageSquare className="w-5 h-5 text-gray-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors" />
                  {faq.q}
                </h3>
                <p className="text-gray-600 dark:text-slate-400 leading-relaxed pl-8 transition-colors">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GLOBAL FOOTER */}
      <SiteFooter />
    </div>
  );
}
