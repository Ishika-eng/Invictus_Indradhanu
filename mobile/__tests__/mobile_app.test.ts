import { TRANSLATIONS } from '../src/localization/translations';
import { CONFIG } from '../src/constants/config';
import { COLORS } from '../src/constants/colors';

describe('Indradhanu Mobile App - Unit & Architecture Tests', () => {
  describe('Multilingual Localization (Marathi, Hindi, Telugu, English)', () => {
    const requiredKeys = [
      'appName',
      'selectLanguage',
      'continue',
      'sendOtp',
      'verifyOtp',
      'fullName',
      'village',
      'district',
      'state',
      'addFarm',
      'farmName',
      'acreage',
      'soilType',
      'captureGps',
      'logout',
      'tabHome',
      'tabWeather',
      'tabRisk',
      'tabFarms',
      'tabProfile',
    ];

    const languages = ['mr', 'hi', 'te', 'en'] as const;

    languages.forEach((lang) => {
      it(`should have translation keys for ${lang}`, () => {
        expect(TRANSLATIONS[lang]).toBeDefined();
        requiredKeys.forEach((key) => {
          expect(TRANSLATIONS[lang][key]).toBeTruthy();
          expect(typeof TRANSLATIONS[lang][key]).toBe('string');
        });
      });
    });
  });

  describe('Configuration & Theming', () => {
    it('should have valid API and Supabase configurations', () => {
      expect(CONFIG.API_URL).toBeDefined();
      expect(CONFIG.SUPABASE_URL).toBeDefined();
      expect(CONFIG.SUPABASE_ANON_KEY).toBeDefined();
      expect(CONFIG.DEFAULT_LANGUAGE).toBe('mr');
    });

    it('should have consistent agronomic theme colors', () => {
      expect(COLORS.primary).toBe('#2D6A4F');
      expect(COLORS.primaryDark).toBe('#1B4332');
      expect(COLORS.riskCritical).toBe('#DC2626');
      expect(COLORS.riskHigh).toBe('#FFEDD5');
      expect(COLORS.riskMod).toBe('#FEF3C7');
      expect(COLORS.riskLow).toBe('#DCFCE7');
    });
  });
});
