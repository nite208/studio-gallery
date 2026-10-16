import type { JSX } from 'react';
import { buildDeliveryUrl } from '../../lib/cloudinaryUrl';
import { Container } from '../layout/Container';
import styles from './HeroSection.module.css';

export interface HeroSectionProps {
  readonly studioName: string;
  readonly tagline: string;
  readonly coverPublicId?: string;
  readonly cloudName: string;
}

export function HeroSection({
  studioName,
  tagline,
  coverPublicId,
  cloudName,
}: HeroSectionProps): JSX.Element {
  const hasCover = Boolean(coverPublicId && cloudName);
  const coverUrl = hasCover
    ? buildDeliveryUrl(cloudName, coverPublicId as string, 1920)
    : undefined;

  return (
    <section
      className={styles.hero}
      style={coverUrl ? { backgroundImage: `url(${coverUrl})` } : undefined}
      aria-label="Studio hero"
    >
      {hasCover && <div className={styles.overlay} aria-hidden="true" />}
      <Container>
        <div className={styles.content}>
          <h1 className={styles.heading}>{studioName}</h1>
          <p className={styles.tagline}>{tagline}</p>
        </div>
      </Container>
      <a href="#gallery" className={styles.scrollCue} aria-label="Scroll to gallery">
        <span className={styles.arrow} aria-hidden="true">↓</span>
      </a>
    </section>
  );
}
