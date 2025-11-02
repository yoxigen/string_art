import { getPatternURL } from './helpers/url_utils';
import type Renderer from './infra/renderers/Renderer';
import SVGRenderer from './infra/renderers/SVGRenderer';
import type StringArt from './infra/StringArt';

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

export async function isShareSupported() {
  if (!navigator.share) {
    return false;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, 1, 1);

  const dataURL = canvas.toDataURL();

  const shareData = await dataURLToShareData(dataURL, 'test', 'test.jpg');
  return navigator.canShare(shareData);
}

async function dataURLToShareData(
  dataURL: string,
  text: string,
  filename: string,
  url?: string
): Promise<ShareData> {
  const blob = await (await fetch(dataURL)).blob();
  const files = [
    new File([blob], filename, {
      type: blob.type,
      lastModified: new Date().getTime(),
    }),
  ];
  return {
    url: url ?? window.location.href,
    files,
    title: document.title,
    text,
  };
}

async function getShareData({
  renderer,
  pattern,
}: ShareInput): Promise<ShareData> {
  const dataUrl = renderer.toDataURL();
  return dataURLToShareData(
    dataUrl,
    'String Art Studio - ' + pattern.name,
    pattern.name + '.jpg',
    getPatternURL(pattern, {
      renderer: renderer instanceof SVGRenderer ? 'svg' : 'canvas',
      patternAsTemplate: true,
    })
  );
}
