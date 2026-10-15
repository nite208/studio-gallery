import { describe, it, expect } from 'vitest';
import { siteConfig } from './site';

describe('siteConfig', () => {
  it('contains valid placeholder brand and contact values', () => {
    expect(siteConfig.studioName).toBe('Studio Placeholder');
    expect(siteConfig.tagline.length).toBeGreaterThan(0);
    expect(siteConfig.whatsappNumber).toBe('15550192834');
    expect(siteConfig.email).toContain('@');
    expect(siteConfig.address.length).toBeGreaterThan(0);
    expect(siteConfig.socialLinks.length).toBeGreaterThan(0);
    expect(siteConfig.galleryAltPrefix).toBe('Project photo');
  });

  it('contains valid theme colors including brown palette and white', () => {
    expect(siteConfig.theme.primaryBrown).toBe('#4a2c1d');
    expect(siteConfig.theme.secondaryBrown).toBe('#784b30');
    expect(siteConfig.theme.lightBrown).toBe('#d7c4b7');
    expect(siteConfig.theme.darkBrown).toBe('#2b1810');
    expect(siteConfig.theme.backgroundBrown).toBe('#fdfbf7');
    expect(siteConfig.theme.white).toBe('#ffffff');
  });
});
