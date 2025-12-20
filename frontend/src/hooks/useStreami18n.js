import { Streami18n } from 'stream-chat-react';
import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook to manage Stream Chat SDK translations and sync with app's i18next language.
 * Stream Chat SDK has built-in support for Japanese but NOT Vietnamese.
 * This hook registers custom Vietnamese translations and syncs language changes.
 */
export const useStreami18n = () => {
    const { i18n } = useTranslation();
    const [streami18n, setStreami18n] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const initializingRef = useRef(false);

    // Initialize Streami18n with translations
    useEffect(() => {
        if (initializingRef.current) return;
        initializingRef.current = true;

        const initStreami18n = async () => {
            try {
                // Create Streami18n instance with current language
                const instance = new Streami18n({ language: i18n.language });

                // Load and register Vietnamese translations (not built-in)
                const viResponse = await fetch('/i18n/stream-vi.json');
                const viTranslations = await viResponse.json();
                instance.registerTranslation('vi', viTranslations);

                // Load and register Japanese translations (override built-in)
                const jaResponse = await fetch('/i18n/stream-ja.json');
                const jaTranslations = await jaResponse.json();
                instance.registerTranslation('ja', jaTranslations);

                // Set the language to match current app language
                await instance.setLanguage(i18n.language);

                setStreami18n(instance);
                setIsReady(true);
            } catch (error) {
                console.error('Failed to initialize Streami18n:', error);
                // Fallback to default instance
                const fallbackInstance = new Streami18n({ language: 'en' });
                setStreami18n(fallbackInstance);
                setIsReady(true);
            }
        };

        initStreami18n();
    }, []);

    // Sync language changes from app i18next to Streami18n
    useEffect(() => {
        if (streami18n && isReady) {
            streami18n.setLanguage(i18n.language);
        }
    }, [i18n.language, streami18n, isReady]);

    return { streami18n, isReady };
};
