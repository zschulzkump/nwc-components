const NWCDropdownItemTemplate = document.createElement('template');

NWCDropdownItemTemplate.innerHTML = `
    <style>
        @import url("./components/assets/gui-icons.css");
        :host {
            display: block;
            width: 100%;
            height: max-content;
        }
        :host([hidden]) {
            display: none;  
        }
        .nwc-dropdown-item {
            user-select: none;
            padding-top: 10px;
            padding-bottom: 10px;
            padding-left: 10px;
            padding-right: 10px;
            cursor: pointer;
            background-color: var(--nwc-dropdown-item-background-color);
            color: var(--nwc-dropdown-item-foreground-color);        
        }
        .nwc-dropdown-item:hover {
            background-color: var(--nwc-dropdown-item-background-color-hover);
        }
        .nwc-dropdown-item-text {
            user-select: none;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 1rem;
            
        }
    </style>
    <div part="base" class="nwc-dropdown-item">
        <span part="text" class="nwc-dropdown-item-text"></span>
    </div>
`;

class NWCDropdownItem extends HTMLElement {
    constructor() {
        super();

        this._text = '';
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(NWCDropdownItemTemplate.content.cloneNode(true));
    }

    connectedCallback() {

        this.shadowRoot.querySelector('.nwc-dropdown-item').addEventListener('click', this._createNWCDropdownItemClicked.bind(this))

        if (!this.hasAttribute('content')) {
            this.setAttribute('content', this._text);
        }
        if (!this.hasAttribute('slot')) {
            this.setAttribute('slot', 'nwc-dropdown-menu');
        }

        this._addText();
    }

    disconnectedCallback() {
        this.shadowRoot.querySelector('.nwc-dropdown-item').removeEventListener('click', this._createNWCDropdownItemClicked.bind(this))
    }

    _createNWCDropdownItemClicked() {
        this.dispatchEvent(new CustomEvent('nwcDropdownItemClicked', {
            detail:{
            dropdownItem: this._text.trim().toLowerCase()
            },
            bubbles: true,
            cancelable: false,
            composed: true
        }))
    }

    _addText() {
        this.shadowRoot.querySelector(".nwc-dropdown-item-text").textContent = this._text;
    }

    get text() {
        return this._text;
    }
    set text(Value) {
        this._text = Value;
        this.setAttribute('content', Value);
    }

    static get observedAttributes() {
        return ["content"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            if (name === "content") {
                this._text = newValue; 
            }
        }
    }
}

window.customElements.define('nwc-dropdown-item', NWCDropdownItem)