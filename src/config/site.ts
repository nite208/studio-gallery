import type { SiteConfig } from '../types/site';

export const siteConfig: SiteConfig = {
  studioName: 'Studio Placeholder',
  tagline: 'Artistic Photography and Visual Storytelling',
  logoUrl: undefined,
  whatsappNumber: '15550192834',
  email: 'contact@studioplaceholder.com',
  address: '100 Artisan Way, Suite 4, Creative City',
  socialLinks: [
    {
      name: 'Instagram',
      url: 'https://instagram.com/studioplaceholder',
    },
    {
      name: 'Pinterest',
      url: 'https://pinterest.com/studioplaceholder',
    },
  ],
  galleryAltPrefix: 'Project photo',
  theme: {
    primaryBrown: '#4a2c1d',
    secondaryBrown: '#784b30',
    lightBrown: '#d7c4b7',
    darkBrown: '#2b1810',
    backgroundBrown: '#fdfbf7',
    white: '#ffffff',
  },
};
