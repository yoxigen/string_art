export default class EventBus<TEvents extends Record<string, any>> {
  #eventHandlers: {
    [K in keyof TEvents]: Array<(payload: TEvents[K]) => void>;
  } = {} as any;

  addEventListener<K extends keyof TEvents>(
    event: K,
    handler: (payload: TEvents[K]) => void
  ) {
    const handlers = (this.#eventHandlers[event] ??= []);
    if (!handlers.includes(handler)) {
      handlers.push(handler);
    }
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
