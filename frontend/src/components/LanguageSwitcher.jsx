import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="absolute top-4 right-4 z-50">
            <div className="flex gap-2">
                <button
                    onClick={() => changeLanguage("vi")}
                    className={`px-3 py-1 rounded-md transition-colors ${i18n.language === "vi"
                            ? "bg-purple-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                >
                    🇻🇳 VI
                </button>
                <button
                    onClick={() => changeLanguage("ja")}
                    className={`px-3 py-1 rounded-md transition-colors ${i18n.language === "ja"
                            ? "bg-purple-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                >
                    🇯🇵 JA
                </button>
            </div>
        </div>
    );
};

export default LanguageSwitcher;
