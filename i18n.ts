
// Simple i18n configuration without next-intl server dependency
export const locales = ['en', 'es'];
export const defaultLocale = 'en';

export async function getMessages(locale: string) {
  try {
    const messages = await import(`./messages/${locale}.json`);
    return messages.default;
  } catch (error) {
    // Fallback to English if locale not found
    const fallback = await import('./messages/en.json');
    return fallback.default;
  }
}
