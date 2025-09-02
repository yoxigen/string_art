import CanvasRenderer from '../renderers/CanvasRenderer';
import SVGRenderer from '../renderers/SVGRenderer';
import StringArt from '../StringArt';
import { Dimensions } from '../types/general.types';

interface DownloadData {
  data: string;
  filename: string;
}

export interface DownloadPatternOptions {
  size: Dimensions;
  filename?: string;
  includeNails?: boolean;
  type?: 'svg' | 'canvas';
}

export function downloadFile({ data, filename }: DownloadData) {
  const downloadLink = document.createElement('a');
  downloadLink.href = data;
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

export function downloadPattern(
  pattern: StringArt,
  { type, includeNails, ...restOptions }: DownloadPatternOptions
) {
  const downloadData =
    type === 'svg'
      ? patternToSVGDownloadData(pattern, restOptions)
      : patternToImageDownloadData(pattern, restOptions);
  downloadFile(downloadData);
}

function patternToImageDownloadData(
  pattern: StringArt,
  { size, filename }: { size: Dimensions; filename?: string }
): DownloadData {
  const parentElement = document.createElement('article');
  const renderer = new CanvasRenderer(parentElement, { updateOnResize: false });

  renderer.disablePixelRatio();
  renderer.setFixedSize(size);

  pattern.draw(renderer);

  return {
    data: renderer.toDataURL(),
    filename: filename ?? pattern.name + '.png',
  };
}

function patternToSVGDownloadData(
  pattern: StringArt,
  { size, filename }: { size: Dimensions; filename?: string }
): DownloadData {
  const parentEl = document.createElement('article');
  parentEl.style.width = size[0] + 'px';
  parentEl.style.height = size[1] + 'px';
  document.body.appendChild(parentEl);
  const renderer = new SVGRenderer(parentEl);
  renderer.setFixedSize(size);
  pattern.draw(renderer);

  const svgData = renderer.svg.outerHTML;
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  return {
    data: URL.createObjectURL(svgBlob),
    filename: filename ?? pattern.name + '.svg',
  };
}

// function patternToNailsImageData(
//   pattern,
//   options: { size: Dimensions; filename?: string }
// ): DownloadData {
//   const currentConfig = pattern.config;
//   pattern.config = {
//     ...currentConfig,
//     darkMode: false,
//     showNails: true,
//     showNailNumbers: withNumbers,
//     showStrings: false,
//     nailsColor: '#000000',
//     backgroundColor: '#ffffff',
//   };

//   downloadCanvas(`${currentPattern.name}_nails_map.png`);

//   currentPattern.config = currentConfig;
//   //currentPattern.draw();
//   // TODO: create an offline canvas and download it
// }
