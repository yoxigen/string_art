class DropdownMenuSeparator extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot!.innerHTML = `
      <style>
        hr {
            margin: 8px 0;
            border: solid 1px rgba(255,255,255,.1);
        }
      </style>
      <hr />
    `;
  }
}

customElements.define('dropdown-menu-separator', DropdownMenuSeparator);
