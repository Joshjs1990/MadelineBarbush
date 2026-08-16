export type PhotoGallery = { images: string[] };
export const PHOTO_GALLERY_DEFAULTS: PhotoGallery = { images: [] };
export function normalizePhotoGallery(input: Partial<PhotoGallery>): PhotoGallery { const images = input.images?.map((item) => item.trim()).filter((item) => item.includes("/uploads/")); return { images: images ?? PHOTO_GALLERY_DEFAULTS.images }; }
