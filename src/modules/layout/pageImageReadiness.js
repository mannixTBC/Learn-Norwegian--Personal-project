/** Only wait for images in the first visible screen, including CSS backgrounds. */
export function visiblePageImages(root) {
  const images = new Set();
  const backgrounds = new Set();
  for (const element of root.querySelectorAll('*')) {
    if (element.closest('.page-loading')) continue;
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height || rect.bottom <= 0 || rect.top >= window.innerHeight
      || rect.right <= 0 || rect.left >= window.innerWidth) continue;
    const style = window.getComputedStyle(element);
    if (style.visibility === 'hidden' || style.opacity === '0') continue;
    if (element.tagName === 'IMG' && !element.complete) images.add(element);
    for (const match of style.backgroundImage.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*?))\s*\)/g)) {
      const url = (match[1] ?? match[2] ?? match[3]).trim();
      if (url && !url.startsWith('data:')) backgrounds.add(url);
    }
  }
  for (const url of backgrounds) {
    const image = new Image();
    image.src = url;
    if (!image.complete) images.add(image);
  }
  return [...images];
}

export function imageReady(image, signal) {
  return new Promise(resolve => {
    const finish = () => {
      image.removeEventListener('load', loaded);
      image.removeEventListener('error', finish);
      signal.removeEventListener('abort', finish);
      resolve();
    };
    const loaded = () => {
      // A loaded image may still need decoding before the browser can paint it.
      if (typeof image.decode === 'function') image.decode().catch(() => {}).then(finish);
      else finish();
    };
    image.addEventListener('load', loaded, { once: true });
    image.addEventListener('error', finish, { once: true });
    signal.addEventListener('abort', finish, { once: true });
    if (signal.aborted) finish();
    else if (image.complete) loaded();
  });
}
