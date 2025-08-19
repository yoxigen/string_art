export class DropdownMenu extends HTMLElement {
  private button!: HTMLButtonElement;
  #buttonStyle: string;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: inline-block;
          position: relative;
        }

        button {
          display: block;
          padding: 10px 15px;
          background: transparent;
          color: white;
          border: none;
          cursor: pointer;
          font: inherit;
        }

        button:hover {
          background: #444;
        }

        button:focus {
          background: rgba(255,255,255,.2)
        }
        ul {
          display: none;
          position: absolute;
          top: 100%;
          right: 0;
          min-width: 120px;
          background: var(--color-dialog-background);
          border: var(--border-dialog);
          margin: 0;
          padding: 0;
          list-style: none;
          z-index: 1000;
          box-shadow: 1px 1px 10px rgba(0,0,0,.7)
        }

        :host(.open) ul {
          display: block;
        }
      </style>

      <button aria-haspopup="true" aria-expanded="false">
        <slot name="label">Menu</slot>
      </button>
      <ul role="menu">
        <slot></slot>
      </ul>
    `;
  }

  connectedCallback(): void {
    this.button = this.shadowRoot!.querySelector('button') as HTMLButtonElement;
    this.button.addEventListener('click', () => this.toggle());

    if (this.#buttonStyle) {
      this.button.style = this.#buttonStyle;
    }
    document.addEventListener('click', e => {
      if (
        !this.contains(e.target as Node) &&
        !this.shadowRoot!.contains(e.target as Node)
      ) {
        this.close();
      }
    });

    this.button.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.close();
        this.button.focus();
      }
    });

    // Listen for selection from child items
    this.addEventListener('item-selected', (e: Event) => {
      const customEvent = e as CustomEvent<{ value: string }>;
      this.dispatchEvent(
        new CustomEvent('select', {
          detail: { value: customEvent.detail.value },
          bubbles: true,
          composed: true,
        })
      );
      this.close();
    });
  }

  static get observedAttributes() {
    return ['button-style'];
  }

  attributeChangedCallback(name: string, oldVal: string, newVal: string) {
    if (name === 'button-style') {
      if (this.button) {
        this.button.style = newVal;
      } else {
        this.#buttonStyle = newVal;
      }
    }
  }

  private toggle(): void {
    const isOpen = this.classList.toggle('open');
    this.button.setAttribute('aria-expanded', String(isOpen));
  }

  private close(): void {
    this.classList.remove('open');
    this.button.setAttribute('aria-expanded', 'false');
  }
}

customElements.define('dropdown-menu', DropdownMenu);
