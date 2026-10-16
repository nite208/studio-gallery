export const CLOUDINARY_SRCSET_WIDTHS: readonly number[] = [400, 800, 1200, 1600];

export function buildDeliveryUrl(cloudName: string, publicId: string, width: number): string {
  const cleanId = publicId.startsWith('/') ? publicId.slice(1) : publicId;
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_${width}/${cleanId}`;
}

export function buildSrcSet(cloudName: string, publicId: string): string {
  return CLOUDINARY_SRCSET_WIDTHS.map(
    (width) => `${buildDeliveryUrl(cloudName, publicId, width)} ${width}w`
  ).join(', ');
}
