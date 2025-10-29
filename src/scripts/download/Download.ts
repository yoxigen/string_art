import { lengthConvert, sizeConvert } from '../helpers/size_utils';
import CanvasRenderer from '../infra/renderers/CanvasRenderer';
import SVGRenderer from '../infra/renderers/SVGRenderer';
import StringArt from '../infra/StringArt';
import { CommonConfig } from '../types/config.types';
import { Dimensions, LengthUnit, SizeUnit } from '../types/general.types';
import { RendererType } from '../types/stringart.types';

interface DownloadData {
  data: Blob;
  filename: string;
}

export type ImageType = 'png' | 'jpeg' | 'webp';
export interface DownloadPatternOptions {
  size: Dimensions;
  units?: SizeUnit;
  dpi?: number;
  filename?: string;
  isNailsMap?: boolean;
  includeNailNumbers?: boolean;
  type?: RendererType;
  imageType?: ImageType;
  margin?: number;
  enableBackground?: boolean;
  sizeId?: string;
  isRotated?: boolean;
}

export function downloadFile({ data, filename }: DownloadData) {
  const dataUrl = URL.createObjectURL(data);

  const downloadLink = document.createElement('a');
  downloadLink.href = dataUrl;
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  URL.revokeObjectURL(dataUrl);
}

export async function downloadPattern(
  pattern: StringArt,
  { type, ...options }: DownloadPatternOptions
): Promise<void> {
  const overridingConfig = getConfigForDownloadOptions(options);
  if (overridingConfig) {
    pattern = pattern.copy();
    pattern.assignConfig(overridingConfig);
  }

  if (options.units) {
    options = {
      ...options,
      size: sizeConvert(options.size, options.units, 'px', options.dpi),
    };
  }

  const downloadData =
    type === 'svg'
      ? patternToSVGDownloadData(pattern, options)
      : await patternToImageDownloadData(pattern, options);
  downloadFile(downloadData);
}

export function getConfigForDownloadOptions(
  options: DownloadPatternOptions
): Partial<CommonConfig> | null {
  const config: Partial<CommonConfig> = {};

  if (options.margin) {
    config.margin = lengthConvert(
      options.margin,
      options.units ?? 'px',
      'px',
      options.dpi
    );
  }

  if (options.isNailsMap) {
    Object.assign(config, {
      darkMode: false,
      showNails: true,
      showNailNumbers: options.includeNailNumbers,
      showStrings: false,
      nailsColor: '#000000',
      backgroundColor: '#ffffff',
    });
  }

  if (options.enableBackground != null) {
    Object.assign(config, {
      enableBackground: options.enableBackground,
    });
  }

  return Object.keys(config).length === 0 ? null : config;
}

async function patternToImageDownloadData(
  pattern: StringArt,
  {
    size,
    filename,
    imageType,
  }: { size: Dimensions; filename?: string; imageType?: ImageType }
): Promise<DownloadData> {
  const parentElement = document.createElement('article');
  const renderer = new CanvasRenderer(parentElement, { updateOnResize: false });

  renderer.disablePixelRatio();
  renderer.setFixedSize(size);

  pattern.draw(renderer);

  return {
    data: await renderer.toBlob(imageType),
    filename: `${filename ?? pattern.name}.${imageType ?? 'png'}`,
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
    data: svgBlob,
    filename: filename ?? pattern.name + '.svg',
  };
}
