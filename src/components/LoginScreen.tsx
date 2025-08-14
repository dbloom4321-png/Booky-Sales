import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Phone, Eye, EyeOff } from "lucide-react";

interface LoginScreenProps {
  onLogin: (email: string, password: string) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onLogin("demo@booky.com", "google-auth");
    } catch (error) {
      console.error("Google login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onLogin("demo@booky.com", "microsoft-auth");
    } catch (error) {
      console.error("Microsoft login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSlackLogin = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onLogin("demo@booky.com", "slack-auth");
    } catch (error) {
      console.error("Slack login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactSales = () => {
    // In a real app, this would open a contact form or calendly link
    window.open("mailto:sales@booky.com?subject=Enterprise%20Demo%20Request", "_blank");
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setEmailError("");
    setPasswordError("");

    // Validation
    if (!email) {
      setEmailError("Email is required");
      return;
    }
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    if (!password) {
      setPasswordError("Password is required");
      return;
    }
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onLogin(email, password);
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Enhanced Logo/Brand */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="h-9 w-9 text-white" fill="currentColor" viewBox="0 0 24 24">
                {/* Left page */}
                <path d="M3 5h8v14H3c-0.55 0-1-0.45-1-1V6c0-0.55 0.45-1 1-1z"/>
                {/* Right page */}
                <path d="M13 5h8c0.55 0 1 0.45 1 1v12c0 0.55-0.45 1-1 1h-8V5z"/>
                {/* Center spine crease */}
                <path d="M11 5v14h2V5h-2z" opacity="0.6"/>
                
                {/* Page content lines - left side */}
                <rect x="4.5" y="7" width="5" height="0.8" rx="0.4" opacity="0.4"/>
                <rect x="4.5" y="9" width="4.5" height="0.8" rx="0.4" opacity="0.4"/>
                <rect x="4.5" y="11" width="5.5" height="0.8" rx="0.4" opacity="0.4"/>
                <rect x="4.5" y="13" width="4" height="0.8" rx="0.4" opacity="0.4"/>
                
                {/* Page content lines - right side */}
                <rect x="14.5" y="7" width="5" height="0.8" rx="0.4" opacity="0.4"/>
                <rect x="14.5" y="9" width="4.5" height="0.8" rx="0.4" opacity="0.4"/>
                <rect x="14.5" y="11" width="5.5" height="0.8" rx="0.4" opacity="0.4"/>
                <rect x="14.5" y="13" width="4" height="0.8" rx="0.4" opacity="0.4"/>
              </svg>
            </div>
            <span className="text-5xl font-bold text-gray-900 tracking-tight">Booky</span>
          </div>
          <p className="text-gray-600 text-lg">
            Automated calendar invite engine
          </p>
          <p className="text-gray-500 mt-2">
            Sign in to your account
          </p>
        </div>

        {/* OAuth Login Buttons */}
        <div className="space-y-3 mb-8">
          <Button 
            variant="outline" 
            className="w-full h-12 justify-center text-sm font-normal border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all" 
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <Button 
            variant="outline" 
            className="w-full h-12 justify-center text-sm font-normal border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
            onClick={handleMicrosoftLogin}
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#f25022" d="M1 1h10v10H1z"/>
              <path fill="#00a4ef" d="M13 1h10v10H13z"/>
              <path fill="#7fba00" d="M1 13h10v10H1z"/>
              <path fill="#ffb900" d="M13 13h10v10H13z"/>
            </svg>
            Continue with Microsoft
          </Button>

          <Button 
            variant="outline" 
            className="w-full h-12 justify-center text-sm font-normal border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
            onClick={handleSlackLogin}
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#E01E5A" d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
            </svg>
            Continue with Slack
          </Button>
        </div>

        {/* Divider */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gradient-to-br from-blue-50 via-white to-gray-50 text-gray-500">or sign in with email</span>
          </div>
        </div>

        {/* Email/Password Login Form */}
        <form onSubmit={handleEmailPasswordLogin} className="space-y-4 mb-8">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              className={`h-12 ${emailError ? 'border-red-300 focus:border-red-500' : ''}`}
              disabled={isLoading}
            />
            {emailError && (
              <p className="text-sm text-red-600">{emailError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError("");
                }}
                className={`h-12 pr-12 ${passwordError ? 'border-red-300 focus:border-red-500' : ''}`}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {passwordError && (
              <p className="text-sm text-red-600">{passwordError}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <a href="#" className="text-blue-600 hover:text-blue-700 underline">
              Forgot password?
            </a>
          </div>

          <Button 
            type="submit"
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all shadow-lg hover:shadow-xl"
            disabled={isLoading}
          >
            Sign In
          </Button>
        </form>

        {/* Contact Sales Button */}
        <div className="mb-8">
          <Button 
            variant="outline"
            className="w-full h-12 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 font-medium transition-all"
            onClick={handleContactSales}
            disabled={isLoading}
          >
            <Phone className="w-5 h-5 mr-3" />
            Contact Sales
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              Signing you in...
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>
            By continuing, you agree to our{" "}
            <a href="#" className="text-blue-600 hover:text-blue-700 underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:text-blue-700 underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}