import type { JSX } from 'react';
import { siteConfig } from '../../config/site';
import styles from './Footer.module.css';

export function Footer(): JSX.Element {
  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}`;

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.contactSection}>
          <h2 className={styles.heading}>{siteConfig.studioName}</h2>
          <p className={styles.tagline}>{siteConfig.tagline}</p>
          <p className={styles.address}>{siteConfig.address}</p>
          <p className={styles.email}>
            <a href={`mailto:${siteConfig.email}`} className={styles.contactLink}>
              {siteConfig.email}
            </a>
          </p>
          <p className={styles.whatsapp}>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappLink}
            >
              WhatsApp
            </a>
          </p>
        </div>
        <div className={styles.socialSection}>
          <h3 className={styles.subHeading}>Connect</h3>
          <ul className={styles.socialList}>
            {siteConfig.socialLinks.map((link) => (
              <li key={link.name} className={styles.socialItem}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
