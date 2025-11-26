import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { MessageSquare, Video, ShieldCheck } from "lucide-react";
import LanguageSwitcher from "../components/LanguageSwitcher";
import Illustration3D from "../components/Illustration3D";

const HomePage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8 relative overflow-hidden">
      {/* Language Switcher */}
      <LanguageSwitcher />

      <div className="max-w-7xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
        {/* Left Column */}
        <div className="w-full lg:w-1/2 p-12 lg:p-16 flex flex-col justify-center">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-red-400 rounded-full flex items-center justify-center text-white font-bold">
              TH
            </div>
            <span className="text-xl font-bold text-purple-600">TeacherHub</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {t("homepage.title")}
          </h1>

          {/* Description */}
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            {t("homepage.description")}
          </p>

          {/* Features List */}
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

          {/* CTA Button */}
          <Link
            to="/auth"
            className="inline-flex items-center justify-center w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-purple-200"
          >
            {t("homepage.cta")}
          </Link>
        </div>

        {/* Right Column - Illustration */}
        <div className="w-full lg:w-1/2 bg-gray-100 relative flex items-center justify-center p-8">
          <div className="absolute inset-0 border-l border-gray-200" />
          <Illustration3D />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
