export default class Renderer {
  constructor(parentElement) {
    this.parentElement = parentElement;
  }

  destroy() {
    this.parentElement.removeElement(this.element);
  }

  get element() {
    throw new Error('element getter not implemented!');
  }

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
    const { width, height } = this.parentElement.getBoundingClientRect();
    return [width, height];
  }

  setSize(size) {
    this.size = size;

    this.element.removeAttribute('width');
    this.element.removeAttribute('height');

    if (size) {
      this.element.style.width = `${size.width}px`;
      this.element.style.height = `${size.height}px`;
    } else {
      this.element.removeAttribute('style');
    }
  }

  clear() {
    throw new Error('Renderer "clear" method not implemented!');
  }

  toDataURL() {
    throw new Error('Renderer "toDataURL" method not implemented!');
  }
}
