import Renderer from '../renderers/Renderer.js';
import SVGRenderer from '../renderers/SVGRenderer.js';
import StringArt from '../StringArt.js';
import { Dimensions } from '../types/general.types.js';
import { downloadFile } from './Download.js';

export function downloadPatternAsSVG(pattern: StringArt, size: Dimensions) {
  const parentEl = document.createElement('article');
  parentEl.style.width = size[0] + 'px';
  parentEl.style.height = size[1] + 'px';
  document.body.appendChild(parentEl);
  const svgRenderer = new SVGRenderer(parentEl);

  const PatternConstructor = pattern.constructor as new (
    renderer: Renderer
  ) => StringArt;
  const svgPattern = new PatternConstructor(svgRenderer);

  svgPattern.setConfig(pattern.config);
  svgPattern.draw();

  var svgData = (svgPattern.renderer as SVGRenderer).svg.outerHTML;
  var svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  var svgUrl = URL.createObjectURL(svgBlob);

  downloadFile(svgUrl, pattern.name + '.svg');
  document.body.removeChild(parentEl);
}
