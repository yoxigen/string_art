class DropdownMenuItem extends HTMLElement {
  static get observedAttributes() {
    return ['value'];
  }

  value: string = '';

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot!.innerHTML = `
      <style>
        li {
          list-style: none;
          padding: 12px 32px 12px 20px;
          color: White;
          text-decoration: none;
          white-space: nowrap;
          background: transparent;
          cursor: pointer;
        }
        li:hover {
          background: rgba(255,255,255,.1);
        }
        span:not(:empty) {
          float: left; 
          margin-right: .5em;
          position: relative;
          left: -4px;
          top: 1px;
        }
      </style>
      <li role="menuitem">
        <span id="icon"><slot name="icon"></span>
        <slot></slot>
      </li>
    `;
  }

  connectedCallback(): void {
    const item = this.shadowRoot!.querySelector('li')!;
    item.addEventListener('click', e => {
      e.preventDefault();
      this.dispatchEvent(
        new CustomEvent('item-selected', {
          detail: { value: this.value },
          bubbles: true,
          composed: true,
        })
      );
    });
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    if (name === 'value') {
      this.value = newValue;
    }
  }
}

customElements.define('dropdown-menu-item', DropdownMenuItem);
