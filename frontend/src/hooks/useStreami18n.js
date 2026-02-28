import { Streami18n } from 'stream-chat-react';
import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import 'dayjs/locale/ja';
import calendar from 'dayjs/plugin/calendar';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';

import viTranslations from '../i18n/stream-vi.json';

// Extend dayjs with plugins
dayjs.extend(calendar);
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

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
    const [isReady, setIsReady] = useState(false);
    const streami18nRef = useRef(null);

    // Create Streami18n instance based on current language
    const getStreami18n = () => {
        if (streami18nRef.current) return streami18nRef.current;

        const currentLang = i18n.language || 'ja';

        // Configure dayjs locale
        const dayjsLocale = currentLang === 'vi' ? 'vi' : 'ja';
        dayjs.locale(dayjsLocale);

        // Create Streami18n with custom DateTimeParser
        const instance = new Streami18n({
            language: currentLang,
            DateTimeParser: dayjs,
            dayjsLocaleConfigForLanguage: {
                vi: {
                    calendar: {
                        lastDay: '[Hôm qua lúc] LT',
                        lastWeek: '[Thứ] dddd [tuần trước lúc] LT',
                        nextDay: '[Ngày mai lúc] LT',
                        nextWeek: 'dddd [lúc] LT',
                        sameDay: '[Hôm nay lúc] LT',
                        sameElse: 'L',
                    },
                },
                ja: {
                    calendar: {
                        lastDay: '[昨日] LT',
                        lastWeek: '[先週]dddd LT',
                        nextDay: '[明日] LT',
                        nextWeek: 'dddd LT',
                        sameDay: '[今日] LT',
                        sameElse: 'L',
                    },
                },
            },
        });

        streami18nRef.current = instance;
        return instance;
    };

    // Initialize Streami18n with translations
    useEffect(() => {
        const loadLanguage = async () => {
            try {
                const streami18n = getStreami18n();

                // Register Vietnamese translations (not built-in in Stream SDK)
                streami18n.registerTranslation('vi', viTranslations);

                // Set language to match current app language
                const currentLang = i18n.language || 'ja';
                await streami18n.setLanguage(currentLang);

                // Update dayjs locale
                dayjs.locale(currentLang === 'vi' ? 'vi' : 'ja');

                setIsReady(true);
            } catch (error) {
                console.error('Failed to initialize Streami18n:', error);
                setIsReady(true); // Continue with default English
            }
        };

        loadLanguage();
    }, []);

    // Sync language changes from app i18next to Streami18n
    useEffect(() => {
        if (isReady && streami18nRef.current) {
            const currentLang = i18n.language || 'ja';
            streami18nRef.current.setLanguage(currentLang);
            dayjs.locale(currentLang === 'vi' ? 'vi' : 'ja');
        }
    }, [i18n.language, isReady]);

    return { streami18n: streami18nRef.current || getStreami18n(), isReady };
};

