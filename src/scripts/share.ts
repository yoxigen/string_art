import type Renderer from './renderers/Renderer';
import type StringArt from './StringArt';

export interface ShareInput {
  renderer: Renderer;
  pattern: StringArt<any>;
}

export async function share(input: ShareInput) {
  try {
    navigator.share(await getShareData(input));
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

export async function isShareSupported(input: ShareInput) {
  if (!navigator.share) {
    return false;
  }

  const shareData = await getShareData(input);
  return navigator.canShare(shareData);
}

async function getShareData({ renderer, pattern }: ShareInput) {
  const dataUrl = renderer.toDataURL();
  const blob = await (await fetch(dataUrl)).blob();
  const files = [
    new File([blob], pattern.name + '.jpg', {
      type: blob.type,
      lastModified: new Date().getTime(),
    }),
  ];
  return {
    url: window.location.href,
    files,
    title: document.title,
    text: 'String Art Studio - ' + pattern.name,
  };
}
