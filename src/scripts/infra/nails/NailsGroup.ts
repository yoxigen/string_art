import { NailsRenderOptions } from '../../types/stringart.types';

export default class NailsGroup {
  #xCoordinates: Float16Array;
  #yCoordinates: Float16Array;
  #numbers: Array<string | number>;

  constructor(
    public length: number,
    public options?: Partial<NailsRenderOptions>
  ) {
    this.#xCoordinates = new Float16Array(length);
    this.#yCoordinates = new Float16Array(length);
    this.#numbers = new Array(length);
  }

  setNail(index: number, x: number, y: number, number: string | number) {
    this.#xCoordinates[index] = x;
    this.#yCoordinates[index] = y;
    this.#numbers[index] = number;
  }

  forEach(
    callback: (
      x: number,
      y: number,
      number: string | number,
      index: number
    ) => void
  ): void {
    for (let i = 0; i < this.length; i++) {
      callback(
        this.#xCoordinates[i],
        this.#yCoordinates[i],
        this.#numbers[i],
        i
      );
    }
  }
}
