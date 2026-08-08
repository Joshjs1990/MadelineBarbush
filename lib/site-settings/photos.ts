export type PhotoGallery = { images: string[] };
export const PHOTO_GALLERY_DEFAULTS: PhotoGallery = { images: ["/images/actor-wide.jpg", "/images/actor-close.jpg", "/images/work/glasshouse-static.webp", "/images/work/saints-service-door.webp", "/images/work/platform-strangers.webp"] };
export function normalizePhotoGallery(input: Partial<PhotoGallery>): PhotoGallery { const images = input.images?.map((item) => item.trim()).filter(Boolean); return { images: images?.length ? images : PHOTO_GALLERY_DEFAULTS.images }; }
