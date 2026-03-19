import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({requestLocale}) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;
 
  // Ensure that a valid locale is used
  if (!locale || !['es', 'en'].includes(locale)) {
    locale = 'es';
  }
  
  // Map 'en' to 'in.json' as requested by the user
  const jsonFile = locale === 'en' ? 'in' : locale;
 
  return {
    locale,
    messages: (await import(`../app/languages/${jsonFile}.json`)).default
  };
});