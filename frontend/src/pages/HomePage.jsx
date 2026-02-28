import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MessageSquare, Video, ShieldCheck, X } from "lucide-react";
import { SignIn, SignUp } from "@clerk/clerk-react";
import LanguageSwitcher from "../components/LanguageSwitcher";
import Illustration3D from "../components/Illustration3D";

const HomePage = () => {
  const { t } = useTranslation();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("sign-in");

  useEffect(() => {
    if (!showAuth) return;

    const checkClerkLinks = () => {
      const footerLinks = document.querySelectorAll('.clerk-auth-wrapper a[href*="sign-up"], .clerk-auth-wrapper a[href*="sign-in"]');
      footerLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && (href.includes('sign-up') || href.includes('sign-in'))) {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (href.includes('sign-up')) {
              setAuthMode('sign-up');
            } else if (href.includes('sign-in')) {
              setAuthMode('sign-in');
            }
          });
        }
      });
    };

    const timer = setTimeout(checkClerkLinks, 100);
    const observer = new MutationObserver(checkClerkLinks);
    const authWrapper = document.querySelector('.clerk-auth-wrapper');
    if (authWrapper) {
      observer.observe(authWrapper, { childList: true, subtree: true });
    }

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [showAuth, authMode]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8 relative overflow-hidden">
      <LanguageSwitcher />

      <div className="max-w-7xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
        {/* Left Column */}
        <div className="w-full lg:w-1/2 p-12 lg:p-16 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-red-400 rounded-full flex items-center justify-center text-white font-bold">
              TH
            </div>
            <span className="text-xl font-bold text-purple-600">TechHub</span>
          </div>

          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {t("homepage.title")}
          </h1>

          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            {t("homepage.description")}
          </p>

          <div className="space-y-4 mb-10">
            <div className="flex items-center gap-3 bg-gray-100 p-4 rounded-xl">
              <MessageSquare className="text-purple-500 w-6 h-6" />
              <span className="font-medium text-gray-700">{t("homepage.features.realtime")}</span>
            </div>
            <div className="flex items-center gap-3 bg-gray-100 p-4 rounded-xl">
              <Video className="text-purple-500 w-6 h-6" />
              <span className="font-medium text-gray-700">{t("homepage.features.video")}</span>
            </div>
            <div className="flex items-center gap-3 bg-gray-100 p-4 rounded-xl">
              <ShieldCheck className="text-purple-500 w-6 h-6" />
              <span className="font-medium text-gray-700">{t("homepage.features.secure")}</span>
            </div>
          </div>

          <button
            onClick={() => {
              setShowAuth(true);
              setAuthMode("sign-in");
            }}
            className="inline-flex items-center justify-center w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-purple-200"
          >
            {t("homepage.cta")}
          </button>
        </div>

        {/* Right Column */}
        <div className="w-full lg:w-1/2 bg-gray-100 relative flex items-center justify-center p-8">
          <div className="absolute inset-0 border-l border-gray-200" />
          {!showAuth ? (
            <Illustration3D />
          ) : (
            <div className="relative z-10 w-full max-w-md clerk-auth-wrapper translate-x-4 translate-y-2">
              <button
                onClick={() => setShowAuth(false)}
                className="absolute -top-4 -right-4 z-50 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-full">
                {authMode === "sign-in" ? (
                  <SignIn
                    routing="virtual"
                    afterSignInUrl="/chat"
                    appearance={{
                      elements: {
                        rootBox: "w-full",
                        card: "bg-white rounded-2xl shadow-xl w-full",
                        headerTitle: "text-2xl font-bold text-gray-900",
                        headerSubtitle: "text-gray-600",
                        socialButtonsBlockButton: "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700",
                        formButtonPrimary: "bg-purple-600 hover:bg-purple-700 text-white",
                        footerActionLink: "text-purple-600 hover:text-purple-700 font-semibold",
                        footer: "border-t border-gray-200 pt-5 mt-5"
                      },
                      layout: {
                        socialButtonsPlacement: "bottom",
                        socialButtonsVariant: "blockButton"
                      }
                    }}
                  />
                ) : (
                  <SignUp
                    routing="virtual"
                    afterSignUpUrl="/chat"
                    appearance={{
                      elements: {
                        rootBox: "w-full",
                        card: "bg-white rounded-2xl shadow-xl w-full",
                        headerTitle: "text-2xl font-bold text-gray-900",
                        headerSubtitle: "text-gray-600",
                        socialButtonsBlockButton: "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700",
                        formButtonPrimary: "bg-purple-600 hover:bg-purple-700 text-white",
                        footerActionLink: "text-purple-600 hover:text-purple-700 font-semibold",
                        footer: "border-t border-gray-200 pt-5 mt-5"
                      },
                      layout: {
                        socialButtonsPlacement: "bottom",
                        socialButtonsVariant: "blockButton"
                      }
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        /* Hide outer wrapper box */
        .clerk-auth-wrapper > div > div {
          box-shadow: none !important;
        }
        
        /* Ensure only one card visible */
        .clerk-auth-wrapper .cl-rootBox {
          width: 100%;
        }
        
        .clerk-auth-wrapper .cl-card {
          width: 100%;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        }
        
        /* Hide alternative sign in methods */
        .clerk-auth-wrapper [data-localization-key*="alternativeMethods"] {
          display: none !important;
        }
        
        /* Prevent default navigation */
        .clerk-auth-wrapper a[href*="sign-up"],
        .clerk-auth-wrapper a[href*="sign-in"] {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default HomePage;