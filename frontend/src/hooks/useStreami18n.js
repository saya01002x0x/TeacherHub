import { Streami18n } from 'stream-chat-react';
import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import viTranslations from '../i18n/stream-vi.json';

/**
 * Hook to manage Stream Chat SDK translations and sync with app's i18next language.
 * Stream Chat SDK has built-in support for Japanese but NOT Vietnamese.
 * This hook registers Vietnamese translations and syncs language changes.
 * 
 * Following official documentation:
 * https://getstream.io/chat/docs/sdk/react/guides/theming/translations/#add-a-language
 */
export const useStreami18n = () => {
    const { i18n } = useTranslation();
    const [streami18n] = useState(() => new Streami18n());
    const [isReady, setIsReady] = useState(false);
    const initRef = useRef(false);

    // Initialize Streami18n with translations
    useEffect(() => {
        if (initRef.current) return;
        initRef.current = true;

        const loadLanguage = async () => {
            try {
                // Register Vietnamese translations (not built-in in Stream SDK)
                streami18n.registerTranslation('vi', viTranslations);

                // Set language to match current app language
                await streami18n.setLanguage(i18n.language);

                setIsReady(true);
            } catch (error) {
                console.error('Failed to initialize Streami18n:', error);
                setIsReady(true); // Continue with default English
            }
        };

        loadLanguage();
    }, [streami18n, i18n.language]);

    // Sync language changes from app i18next to Streami18n
    useEffect(() => {
        if (isReady) {
            streami18n.setLanguage(i18n.language);
        }
    }, [i18n.language, streami18n, isReady]);

    return { streami18n, isReady };
};
