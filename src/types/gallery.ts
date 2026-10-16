export interface Photo {
  readonly publicId: string;
  readonly width: number;
  readonly height: number;
  readonly createdAt: string;
}

export interface PhotosResponse {
  readonly cloudName: string;
  readonly photos: readonly Photo[];
}

export type GalleryStatus = 'loading' | 'error' | 'empty' | 'ready';
