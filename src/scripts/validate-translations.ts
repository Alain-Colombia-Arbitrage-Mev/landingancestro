/**
 * Translation Validation Script
 *
 * This script validates that all translation keys are present in all languages.
 * Run with: npm run validate-translations
 */

import { translations } from '../i18n/translations';
import { languages } from '../i18n/languages';

type TranslationKey = keyof typeof translations.es;
type Lang = keyof typeof languages;

interface ValidationResult {
  lang: string;
  missingKeys: string[];
  extraKeys: string[];
}

interface ValidationSummary {
  success: boolean;
  results: ValidationResult[];
  totalKeys: number;
  languages: string[];
}

/**
 * Get all keys from a translation object recursively
 */
function getAllKeys(obj: Record<string, any>): string[] {
  return Object.keys(obj).sort();
}

/**
 * Validate translations across all languages
 */
function validateTranslations(): ValidationSummary {
  const baseLanguage = 'es'; // Spanish as base language
  const baseKeys = getAllKeys(translations[baseLanguage]);
  const results: ValidationResult[] = [];

  // Check each language
  for (const [lang, langData] of Object.entries(languages)) {
    if (lang === baseLanguage) continue;

    const langKeys = getAllKeys(translations[lang as Lang]);
    const missingKeys = baseKeys.filter(key => !langKeys.includes(key));
    const extraKeys = langKeys.filter(key => !baseKeys.includes(key));

    results.push({
      lang: `${langData.name} (${lang})`,
      missingKeys,
      extraKeys,
    });
  }

  const success = results.every(r => r.missingKeys.length === 0 && r.extraKeys.length === 0);

  return {
    success,
    results,
    totalKeys: baseKeys.length,
    languages: Object.keys(languages),
  };
}

/**
 * Print validation results to console
 */
function printResults(summary: ValidationSummary) {
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║     TRANSLATION VALIDATION REPORT                 ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  console.log(`📊 Total translation keys: ${summary.totalKeys}`);
  console.log(`🌍 Languages checked: ${summary.languages.join(', ')}\n`);

  if (summary.success) {
    console.log('✅ All translations are complete and consistent!\n');
    return;
  }

  console.log('⚠️  Translation issues found:\n');

  for (const result of summary.results) {
    if (result.missingKeys.length > 0 || result.extraKeys.length > 0) {
      console.log(`\n━━━ ${result.lang} ━━━`);

      if (result.missingKeys.length > 0) {
        console.log(`\n  ❌ Missing ${result.missingKeys.length} keys:`);
        result.missingKeys.forEach(key => {
          console.log(`     - ${key}`);
        });
      }

      if (result.extraKeys.length > 0) {
        console.log(`\n  ⚠️  Extra ${result.extraKeys.length} keys (not in base language):`);
        result.extraKeys.forEach(key => {
          console.log(`     - ${key}`);
        });
      }
    }
  }

  console.log('\n');
}

/**
 * Check for duplicate translation values (possible copy-paste errors)
 */
function checkDuplicateValues() {
  console.log('🔍 Checking for duplicate translation values...\n');

  let foundDuplicates = false;

  for (const [lang, translationData] of Object.entries(translations)) {
    const values = Object.entries(translationData);
    const valueMap = new Map<string, string[]>();

    // Group keys by their values
    for (const [key, value] of values) {
      if (!valueMap.has(value)) {
        valueMap.set(value, []);
      }
      valueMap.get(value)!.push(key);
    }

    // Find duplicates
    const duplicates = Array.from(valueMap.entries())
      .filter(([_, keys]) => keys.length > 1)
      .filter(([value]) => value.length > 5); // Ignore very short values

    if (duplicates.length > 0) {
      foundDuplicates = true;
      console.log(`\n━━━ ${languages[lang as Lang].name} (${lang}) ━━━`);

      for (const [value, keys] of duplicates) {
        console.log(`\n  ⚠️  Duplicate value: "${value}"`);
        console.log(`     Used in keys:`);
        keys.forEach(key => console.log(`       - ${key}`));
      }
    }
  }

  if (!foundDuplicates) {
    console.log('✅ No suspicious duplicate values found!\n');
  } else {
    console.log('\n⚠️  Some translations have duplicate values. Review if this is intentional.\n');
  }
}

// Run validation
const summary = validateTranslations();
printResults(summary);
checkDuplicateValues();

// Exit with error code if validation fails
if (!summary.success) {
  process.exit(1);
}
