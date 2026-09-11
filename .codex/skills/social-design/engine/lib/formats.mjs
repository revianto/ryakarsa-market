// Canvas specs per format. Sizes mirror content-post/references/platform-rules.md —
// when a platform changes a size, update both places.
//
// margin: padding around content. safeBottom/safeTop/safeRight: zones the platform UI
// covers — content must stay out; chrome (wordmark/handle/swipe) may sit inside them.
// maxSlides: platform hard limit for multi-slide formats (1 = single image).

export const FORMATS = {
  'ig-carousel':    { width: 1080, height: 1350, margin: 80,  safeTop: 0,   safeBottom: 150, safeRight: 0,   maxSlides: 20, scale: 2 },
  'ig-feed':        { width: 1080, height: 1350, margin: 80,  safeTop: 0,   safeBottom: 150, safeRight: 0,   maxSlides: 1,  scale: 2 },
  'ig-square':      { width: 1080, height: 1080, margin: 80,  safeTop: 0,   safeBottom: 0,   safeRight: 0,   maxSlides: 20, scale: 2 },
  'ig-story':       { width: 1080, height: 1920, margin: 100, safeTop: 250, safeBottom: 380, safeRight: 0,   maxSlides: 1,  scale: 2 },
  'ig-reels-cover': { width: 1080, height: 1920, margin: 100, safeTop: 250, safeBottom: 380, safeRight: 120, maxSlides: 1,  scale: 2 },
  'tiktok-cover':   { width: 1080, height: 1920, margin: 100, safeTop: 250, safeBottom: 380, safeRight: 120, maxSlides: 1,  scale: 2 },
  'yt-shorts-cover':{ width: 1080, height: 1920, margin: 100, safeTop: 250, safeBottom: 380, safeRight: 120, maxSlides: 1,  scale: 2 },
  'wa-status':      { width: 1080, height: 1920, margin: 100, safeTop: 250, safeBottom: 300, safeRight: 0,   maxSlides: 1,  scale: 2 },
  // YouTube thumbnails are capped at 2 MB — keep 1x.
  'yt-thumbnail':   { width: 1280, height: 720,  margin: 64,  safeTop: 0,   safeBottom: 0,   safeRight: 0,   maxSlides: 1,  scale: 1 },
  'x-image':        { width: 1600, height: 900,  margin: 80,  safeTop: 0,   safeBottom: 0,   safeRight: 0,   maxSlides: 4,  scale: 1 },
  'threads-image':  { width: 1080, height: 1350, margin: 80,  safeTop: 0,   safeBottom: 0,   safeRight: 0,   maxSlides: 20, scale: 2 },
};

export function getFormat(name) {
  const spec = FORMATS[name];
  if (!spec) {
    throw new Error(`Unknown format "${name}". Known: ${Object.keys(FORMATS).join(', ')}`);
  }
  return { name, ...spec };
}
