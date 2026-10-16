import type { JSX } from 'react';
import { useEffect } from 'react';
import { siteConfig } from '../config/site';
import { useGallery } from '../hooks/useGallery';
import { useSetPhotoCount } from '../lib/photoCountContext';
import { HeroSection } from '../components/gallery/HeroSection';
import { GallerySection } from '../components/gallery/GallerySection';

export function HomePage(): JSX.Element {
  const galleryResult = useGallery();
  const setPhotoCount = useSetPhotoCount();

  useEffect(() => {
    if (galleryResult.status === 'ready') {
      setPhotoCount(galleryResult.photos.length);
    } else {
      setPhotoCount(0);
    }
  }, [galleryResult.status, galleryResult.photos.length, setPhotoCount]);

  return (
    <>
      <HeroSection
        studioName={siteConfig.studioName}
        tagline={siteConfig.tagline}
        coverPublicId={siteConfig.coverPublicId}
        cloudName={galleryResult.cloudName}
      />
      <div id="gallery">
        <GallerySection galleryResult={galleryResult} />
      </div>
    </>
  );
}
