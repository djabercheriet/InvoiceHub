'use client'

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { locales } from '@/i18n/config';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    // Basic way to update locale in URL path
    const pathSegments = pathname.split('/');
    if (pathSegments.length > 1 && locales.includes(pathSegments[1] as any)) {
      pathSegments[1] = newLocale;
    } else {
      pathSegments.splice(1, 0, newLocale);
    }
    const newPath = pathSegments.join('/') || '/';
    router.push(newPath);
    router.refresh();
  };

  return (
    <Select value={locale} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[100px] h-8 bg-transparent text-xs font-bold border-border/50">
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        {locales.map((loc) => (
          <SelectItem key={loc} value={loc} className="text-xs font-medium uppercase">
            {loc}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
