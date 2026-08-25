"use client";
import { AuraAuth } from "@/components/storefront/themes/aura/pages/AuraAuth";
import { MarketAuth } from "@/components/storefront/themes/market/pages/MarketAuth";

import { VerdantLogin } from "@/components/storefront/themes/verdant/pages/VerdantAuth";

import { MinimalistHeader } from "@/components/storefront/themes/minimalist/MinimalistHeader";
import { MinimalistFooter } from "@/components/storefront/themes/minimalist/MinimalistFooter";
import Link from "next/link";
import { use } from "react";
import { useStorefrontAuth } from "@/store/useStorefrontAuth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { storefrontAuthAPI, setCookie } from "@/lib/api";


export default function StorefrontLoginPage(props: { 
  params: Promise<{ domain: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = use(props.params);
  const searchParams = props.searchParams ? use(props.searchParams) : {};
  const storeName = params.domain.replace("-", " ").toUpperCase() || "My Store";
  const theme = searchParams?.theme as string;
  const router = useRouter();
  const { login } = useStorefrontAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      try {
        setLoading(true);
        const res: any = await storefrontAuthAPI.login({ email, password });
        const data = res.data || res;
        const userData = data.user;
        
        if (userData && userData.role === 'CUSTOMER') {
          setCookie('storefrontAccessToken', data.accessToken, 15 / (24 * 60));
          setCookie('storefrontRefreshToken', data.refreshToken, 7);
          
          login({
            id: userData.id.toString(),
            name: userData.name,
            email: userData.email,
          });
          toast.success("Successfully logged in!");
          router.push(`/s/${params.domain}/account`);
        } else {
          toast.error("Invalid store account.");
        }
      } catch (error: any) {
        const message = error.response?.data?.message;
        const errorMessage = Array.isArray(message) ? message[0] : (message || "Login failed");
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
    return <AuraAuth storeName={storeName} domain={params.domain} title="Login" children={<form><input type="email" placeholder="Email" className="w-full mb-4 p-3 border border-aura-border bg-transparent font-serif" /><input type="password" placeholder="Password" className="w-full mb-6 p-3 border border-aura-border bg-transparent font-serif" /><button className="w-full bg-black text-white py-4 text-xs font-semibold uppercase tracking-widest hover:bg-zinc-800 transition-colors">Sign In</button></form>} />;
  }

  if (theme === 'verdant') {
    return <VerdantLogin storeName={storeName} domain={params.domain} />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <MinimalistHeader storeName={storeName} domain={params.domain} />
      
      <main className="flex-grow bg-muted flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href={`/s/${params.domain}/register`} className="font-medium text-primary hover:opacity-80 cursor-pointer">
              Sign up
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-background border border-border py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleLogin}>
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
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    disabled={loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-input bg-background rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-foreground">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link href={`/s/${params.domain}/forgot-password`} className="font-medium text-primary hover:opacity-80 cursor-pointer">
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary cursor-pointer disabled:opacity-70"
                >
                  {loading ? "Signing in..." : "Sign in"}
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
