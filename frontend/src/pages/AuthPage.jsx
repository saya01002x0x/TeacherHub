import "../styles/auth.css";
import { SignInButton } from "@clerk/clerk-react";
import { useTranslation } from "react-i18next";

const AuthPage = () => {
  const { t } = useTranslation();

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-hero">
          <div className="brand-container">
            <img src="/logo.png" alt="Slap" className="brand-logo" />
            <span className="brand-name">Slap</span>
          </div>

          <h1 className="hero-title">{t("auth.title")}</h1>

          <p className="hero-subtitle">
            {t("auth.subtitle")}
          </p>

          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">💬</span>
              <span>{t("auth.features.realtime")}</span>
            </div>

            <div className="feature-item">
              <span className="feature-icon">🎥</span>
              <span>{t("auth.features.video")}</span>
            </div>

            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <span>{t("auth.features.secure")}</span>
            </div>
          </div>

          <SignInButton mode="modal">
            <button className="cta-button">
              {t("auth.cta")}
              <span className="button-arrow">→</span>
            </button>
          </SignInButton>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-image-container">
          <img src="/auth-i.png" alt="Team collaboration" className="auth-image" />
          <div className="image-overlay"></div>
        </div>
      </div>
    </div>
  );
};
export default AuthPage;
