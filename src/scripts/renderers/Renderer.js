export default class Renderer {
  constructor(parentElement) {
    this.parentElement = parentElement;
  }

  destroy() {}

  reset() {}

  setColor(color) {
    this.color = color;
  }

  setLineWidth(width) {}

  setBackground(color) {}

  renderLines(startPosition, ...positions) {
    throw new Error('Renderer "renderLines" method not implemented!');
  }

  /**
   * Renders the nails for the string art
   * @param {[{ point: [x: number, y: number], number: string }]} nails
   * @param {*} param1
   */
  renderNails(nails, { color, fontSize, radius, renderNumbers, margin }) {
    throw new Error('Renderer "renderNails" method not implemented!');
  }

  getSize() {
    throw new Error('Renderer "getSize" method not implemented!');
  }

  setSize({ width, height }) {}
  clear() {
    throw new Error('Renderer "clear" method not implemented!');
  }

  toDataURL() {
    throw new Error('Renderer "toDataURL" method not implemented!');
  }
}
