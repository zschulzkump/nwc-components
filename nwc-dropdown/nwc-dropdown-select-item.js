const NWCDropdownSelectItemTemplate = document.createElement('template');

NWCDropdownSelectItemTemplate.innerHTML = `
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
        :host([checked]) > .checkmark {
            display: block;  
        }
        .nwc-dropdown-item {
            user-select: none;
            padding-top: 10px;
            padding-bottom: 10px;
            padding-left: 10px;
            padding-right: 10px;
            cursor: pointer;
            display: grid;
            grid-template-columns: 30px minmax(0px, 1fr);
            grid-template-areas: "checkArea textArea";
            background-color: var(--nwc-dropdown-item-background-color);
            color: var(--nwc-dropdown-item-foreground-color);        
        }
        .nwc-dropdown-item:hover {
            background-color: var(--nwc-dropdown-item-background-color-hover);
        }
        .checkmark {
            grid-area: checkArea;
            display: none;
            justify-self: center;
            align-self: center;
            color: var(--nwc-dropdown-item-foreground-color);
        }
        .nwc-dropdown-item-text {
            grid-area: textArea;
            user-select: none;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 1rem;
            
        }
    </style>
    <div part="base" class="nwc-dropdown-item">
        <span part="checkmark" class="checkmark gui gui-check"></span>
        <span part="text" class="nwc-dropdown-item-text"></span>
    </div>
`;

class NWCDropdownSelectItem extends HTMLElement {
    constructor() {
        super();

        this._text = '';
        this._checked = false;
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
            dropdownItemChecked: this._checked,
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

    get checked() {
        return this._checked;
    }
    set checked(Value) {
        if (Value === '' || Value === 'checked' || Value === 'true') {
            this._checked = true;
            this.setAttribute('checked', '');
        } else {
            this._checked = false;
            this.removeAttribute('checked');
        }
    }

    static get observedAttributes() {
        return ["content", "checked"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            if (name === "content") {
                this._text = newValue; 
            } else if (name === "checked") {
                if (newValue === '' || newValue === 'checked' || newValue === 'true') {
                    this._checked = true; 
                } else {
                    this._checked = false;
                }
            }
        }
    }
}

window.customElements.define('nwc-dropdown-select-item', NWCDropdownSelectItem)