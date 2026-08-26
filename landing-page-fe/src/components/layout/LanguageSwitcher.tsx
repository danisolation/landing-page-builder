'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant={locale === 'vi' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => switchLocale('vi')}
        className="h-8 px-2 text-xs"
      >
        VI
      </Button>
      <Button
        variant={locale === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => switchLocale('en')}
        className="h-8 px-2 text-xs"
      >
        EN
      </Button>
    </div>
  );
}
