export class StringArtDOM {
  constructor() {
    this.eventListeners = new Set();
  }

  addEventListener(element, event, eventHandler) {
    const wrappedEventHandler = e => eventHandler(e);
    element.addEventListener(event, wrappedEventHandler);

    const destroyer = () => {
      element.removeEventListener(event, wrappedEventHandler);
      this.eventListeners.delete(wrappedEventHandler);
    };

    this.eventListeners.add(destroyer);
    return destroyer;
  }

  destroy() {
    this.eventListeners.forEach(eventListener => eventListener());
  }
}
