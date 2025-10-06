import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { initializeI18n } from '@/i18n/config';

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const { ready } = useTranslation();

  useEffect(() => {
    initializeI18n();
  }, []);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
