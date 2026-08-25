"use client";
import { AuraAuth } from "@/components/storefront/themes/aura/pages/AuraAuth";
import { MarketAuth } from "@/components/storefront/themes/market/pages/MarketAuth";

import { VerdantForgotPassword } from "@/components/storefront/themes/verdant/pages/VerdantAuth";

import { MinimalistHeader } from "@/components/storefront/themes/minimalist/MinimalistHeader";
import { MinimalistFooter } from "@/components/storefront/themes/minimalist/MinimalistFooter";
import Link from "next/link";
import { use } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";


export default function StorefrontForgotPasswordPage(props: { 
  params: Promise<{ domain: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = use(props.params);
  const searchParams = props.searchParams ? use(props.searchParams) : {};
  const storeName = params.domain.replace("-", " ").toUpperCase() || "My Store";
  const theme = searchParams?.theme as string;
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Password reset link sent to your email!");
      setIsSubmitted(true);
    }
  };


  if (theme === 'market') {
    return <MarketAuth storeName={storeName} domain={params.domain} />;
  }
  if (theme === 'aura') {
    return <AuraAuth storeName={storeName} domain={params.domain} title="Reset Password" subtitle="Enter your email to receive a reset link" children={<form><input type="email" placeholder="Email" className="w-full mb-6 p-3 border border-aura-border bg-transparent font-serif" /><button className="w-full bg-black text-white py-4 text-xs font-semibold uppercase tracking-widest hover:bg-zinc-800 transition-colors">Send Reset Link</button></form>} />;
  }

  if (theme === 'verdant') {
    return <VerdantForgotPassword storeName={storeName} domain={params.domain} />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <MinimalistHeader storeName={storeName} domain={params.domain} />
      
      <main className="flex-grow bg-muted flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Remembered it?{" "}
            <Link href={`/s/${params.domain}/login`} className="font-medium text-primary hover:opacity-80 cursor-pointer">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-background border border-border py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {isSubmitted ? (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-muted border border-border mb-4">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground">Check your email</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  We've sent password reset instructions to <strong>{email}</strong>
                </p>
                <div className="mt-6">
                  <Link href={`/s/${params.domain}/login`} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary">
                    Return to Login
                  </Link>
                </div>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <p className="text-sm text-muted-foreground text-center">
                  Enter the email address associated with your account and we'll send you a link to reset your password.
                </p>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary cursor-pointer"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <MinimalistFooter storeName={storeName} domain={params.domain} />
    </div>
  );
}
