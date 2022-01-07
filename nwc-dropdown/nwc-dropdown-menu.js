const NWCDropdownMenuTemplate = document.createElement('template');

NWCDropdownMenuTemplate.innerHTML = `
    <style>
        :host {
            display: block;
            width: max-content;
            height: max-content;
            box-sizing: border-box;
        }
        :host([hidden]) {
            display: none;
        }
        .nwc-dropdown-menu {
            user-select: none;
            padding-top: 5px;
            padding-bottom: 5px;
            background-color: var(--nwc-dropdown-menu-background-color);
            box-sizing: border-box;
        }

    </style>
    <div part="base" class="nwc-dropdown-menu">
        <slot name="nwc-dropdown-menu"></slot>
    </div>
`;

class NWCDropdownMenu extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(NWCDropdownMenuTemplate.content.cloneNode(true));
    }

    connectedCallback() {
        if (!this.hasAttribute('slot')) {
            this.setAttribute('slot', 'nwc-dropdown-panel');
        }

    }   
}

window.customElements.define('nwc-dropdown-menu', NWCDropdownMenu)