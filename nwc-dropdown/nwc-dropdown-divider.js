const NWCDropdownDividerTemplate = document.createElement('template');

NWCDropdownDividerTemplate.innerHTML = `
    <style>
        :host {
            display: block;
            width: 100%;
            height: max-content;
        }
        :host([hidden]) {
            display: none;
        }
        .divider {
            user-select: none;
            display: block;
            height: 1px;
            width: 100%;
            background-color: var(--nwc-dropdown-divider-color);
            margin-top: 5px;
            margin-bottom: 5px;
            margin-left: 0;
            margin-right: 0;
        }

    </style>
    <div part="base" class="divider"></div>
`;

class NWCDropdownDivider extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(NWCDropdownDividerTemplate.content.cloneNode(true));
    }

    connectedCallback() {
        if (!this.hasAttribute('slot')) {
            this.setAttribute('slot', 'nwc-dropdown-menu');
        }
    }

   
}

window.customElements.define('nwc-dropdown-divider', NWCDropdownDivider)