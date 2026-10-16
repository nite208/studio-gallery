export interface SocialLink {
  readonly name: string;
  readonly url: string;
}

export interface SiteTheme {
  readonly primaryBrown: string;
  readonly secondaryBrown: string;
  readonly lightBrown: string;
  readonly darkBrown: string;
  readonly backgroundBrown: string;
  readonly white: string;
}

export interface SiteConfig {
  readonly studioName: string;
  readonly tagline: string;
  readonly logoUrl?: string;
  readonly coverPublicId?: string;
  readonly whatsappNumber: string;
  readonly email: string;
  readonly address: string;
  readonly socialLinks: readonly SocialLink[];
  readonly galleryAltPrefix: string;
  readonly theme: SiteTheme;
}
