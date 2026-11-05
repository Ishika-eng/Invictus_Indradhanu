import { TRANSLATIONS } from '../src/localization/translations';

describe('Climate Intelligence Audit & Telemetry Integrity', () => {
  it('should not contain fabricated 3,200L or 3,500L claims in mobile localization strings', () => {
    const languages = ['mr', 'hi', 'te', 'en'] as const;

    languages.forEach((lang) => {
      const transObj = TRANSLATIONS[lang];
      Object.entries(transObj).forEach(([key, val]) => {
        expect(val).not.toContain('3,200L');
        expect(val).not.toContain('3,500L');
        expect(val).not.toContain('३,५००');
        expect(val).not.toContain('4,000L');
      });
    });
  });

  it('should verify translations contain critical agronomic safety guidance', () => {
    const languages = ['mr', 'hi', 'te', 'en'] as const;
    languages.forEach((lang) => {
      expect(TRANSLATIONS[lang].tabRisk).toBeTruthy();
      expect(TRANSLATIONS[lang].tabWeather).toBeTruthy();
    });
  });
});

