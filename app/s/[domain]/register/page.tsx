"use client";
import { AuraAuth } from "@/components/storefront/themes/aura/pages/AuraAuth";
import { MarketAuth } from "@/components/storefront/themes/market/pages/MarketAuth";

import { VerdantRegister } from "@/components/storefront/themes/verdant/pages/VerdantAuth";

import { MinimalistHeader } from "@/components/storefront/themes/minimalist/MinimalistHeader";
import { MinimalistFooter } from "@/components/storefront/themes/minimalist/MinimalistFooter";
import Link from "next/link";
import { use } from "react";
import { useStorefrontAuth } from "@/store/useStorefrontAuth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { storefrontAuthAPI, setCookie } from "@/lib/api";


export default function StorefrontRegisterPage(props: { 
  params: Promise<{ domain: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = use(props.params);
  const searchParams = props.searchParams ? use(props.searchParams) : {};
  const storeName = params.domain.replace("-", " ").toUpperCase() || "My Store";
  const theme = searchParams?.theme as string;
  const router = useRouter();
  const { login } = useStorefrontAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePassword = (pwd: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    const hasNonAlphas = /\W/.test(pwd);

    if (pwd.length < minLength) return "Password must be at least 8 characters long.";
    if (!hasUpperCase) return "Password must contain at least one uppercase letter.";
    if (!hasLowerCase) return "Password must contain at least one lowercase letter.";
    if (!hasNumbers) return "Password must contain at least one number.";
    if (!hasNonAlphas) return "Password must contain at least one special character.";
    
    return "";
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    const pwdError = validatePassword(password);
    if (pwdError) {
      setPasswordError(pwdError);
      return;
    }

    if (name && email && password) {
      try {
        setLoading(true);
        const res: any = await storefrontAuthAPI.registerCustomer({
          name,
          email,
          password,
          subdomain: params.domain,
        });

        const data = res.data || res;
        const userData = data.user;

        if (userData) {
          setCookie('storefrontAccessToken', data.accessToken, 15 / (24 * 60));
          setCookie('storefrontRefreshToken', data.refreshToken, 7);

          login({
            id: userData.id.toString(),
            name: userData.name,
            email: userData.email,
          });
          toast.success("Account created successfully!");
          router.push(`/s/${params.domain}/account`);
        }
      } catch (error: any) {
        const message = error.response?.data?.message;
        const errorMessage = Array.isArray(message) ? message[0] : (message || "Registration failed");
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };


  if (theme === 'market') {
    return <MarketAuth storeName={storeName} domain={params.domain} />;
  }
  if (theme === 'aura') {
    return <AuraAuth storeName={storeName} domain={params.domain} title="Create Account" children={<form><input type="text" placeholder="First Name" className="w-full mb-4 p-3 border border-aura-border bg-transparent font-serif" /><input type="text" placeholder="Last Name" className="w-full mb-4 p-3 border border-aura-border bg-transparent font-serif" /><input type="email" placeholder="Email" className="w-full mb-4 p-3 border border-aura-border bg-transparent font-serif" /><input type="password" placeholder="Password" className="w-full mb-6 p-3 border border-aura-border bg-transparent font-serif" /><button className="w-full bg-black text-white py-4 text-xs font-semibold uppercase tracking-widest hover:bg-zinc-800 transition-colors">Create Account</button></form>} />;
  }

  if (theme === 'verdant') {
    return <VerdantRegister storeName={storeName} domain={params.domain} />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <MinimalistHeader storeName={storeName} domain={params.domain} />
      
      <main className="flex-grow bg-muted flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Create a new account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href={`/s/${params.domain}/login`} className="font-medium text-primary hover:opacity-80 cursor-pointer">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-background border border-border py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleRegister}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-primary">
                  Full name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    disabled={loading}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-primary">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-primary">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    disabled={loading}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
                    className="appearance-none block w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm disabled:opacity-50"
                  />
                </div>
                {passwordError && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {passwordError}
                  </p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary cursor-pointer disabled:opacity-70"
                >
                  {loading ? "Registering..." : "Register"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <MinimalistFooter storeName={storeName} domain={params.domain} />
    </div>
  );
}
