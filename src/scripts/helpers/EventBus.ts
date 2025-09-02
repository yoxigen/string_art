export default class EventBus<TEvents extends Record<string, any>> {
  #eventHandlers: {
    [K in keyof TEvents]: Array<(payload: TEvents[K]) => void>;
  } = {} as any;

  /**
   * Adds an event handler for the specified event
   * @param event
   * @param handler
   * @returns A function that can be called to remove the event handler
   */
  addEventListener<K extends keyof TEvents>(
    event: K,
    handler: (payload: TEvents[K]) => void
  ): Function {
    const handlers = (this.#eventHandlers[event] ??= []);
    if (!handlers.includes(handler)) {
      handlers.push(handler);
    }

    return () => {
      const handlerIndex = handlers.indexOf(handler);
      if (handlerIndex !== -1) {
        handlers.splice(handlerIndex, 1);
      }
    };
  }

  removeEventListener<K extends keyof TEvents>(
    event: K,
    handler: (payload: TEvents[K]) => void
  ) {
    const handlers = this.#eventHandlers[event];
    if (!handlers) return;

    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }

  protected emit<K extends keyof TEvents>(event: K, payload: TEvents[K]) {
    this.#eventHandlers[event]?.forEach(handler => handler(payload));
  }
}
