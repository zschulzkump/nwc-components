const NWCToggleSwitchTemplate = document.createElement('template');

NWCToggleSwitchTemplate.innerHTML = `
    <style>
        :host {
            display: block;
            /*max-width: max-content;*/
            /*max-height: max-content;*/
            cursor: pointer;
            box-sizing: border-box;
        }
        :host([hidden]) {
            display: none;
        }
        .toggle-switch-wrapper {
            display: grid;
            grid-template-columns: max-content max-content;
        }
        .toggle-switch-slide {
            width: 40px;
            height: 20px;
            background-color: var(--nwc-toggle-switch-off-background-color);
            box-shadow: inset 0px 0px 4px rgb(0 0 0 / 70%);
            box-sizing: border-box;
        }    
        .toggle-switch-fill {
            width: 10px;
            height: 20px;
            position: relative;
            background-color: var(--nwc-toggle-switch-on-background-color);
            transition: width 0.1s ease;
            box-shadow: inset 0px 0px 4px rgb(0 0 0 / 70%);
            box-sizing: border-box;
        }
        .toggle-switch-handle {
            width: 10px;
            height: 20px;
            top: 0px;
            right: 0px;
            position: absolute;
            background-color: var(--nwc-toggle-switch-handle-background-color);
            box-shadow: 0px 0px 4px rgb(0 0 0 / 30%);
            box-sizing: border-box;
        }
        :host([checked]) .toggle-switch-fill {
            width: 100%;
        }
    </style>
    <div class="toggle-switch-wrapper">
        <div class="toggle-switch-slide" part="switch">
            <div class="toggle-switch-fill" part="switch-fill"><div class="toggle-switch-handle" part="handle"></div></div>
        </div>
    </div>
`;

class NWCToggleSwitch extends HTMLElement {
    constructor() {
        super();
        
        this._checked = null;
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(NWCToggleSwitchTemplate.content.cloneNode(true));
    }

    connectedCallback() {
        this.shadowRoot.querySelector('.toggle-switch-wrapper').addEventListener('click', this._handleToggleClicked.bind(this));
    }

    disconnectedCallback() {
        this.shadowRoot.querySelector('.toggle-switch-wrapper').removeEventListener('click', this._handleToggleClicked.bind(this));
    }

    _handleToggleClicked() {
        if (!this._checked) {    
            this.setAttribute('checked', '');
        } else {
            this.removeAttribute('checked');
        }
        this._dispatchToggleChecked();
    }

    _dispatchToggleChecked() {
        this.dispatchEvent(new CustomEvent('nwcToggleChecked', {detail:{
            status: this._checked
        }}))
    }
    
    get checked() {
        return this.hasAttribute('checked');
    }

    set checked(Value) {
        if (Value === true || Value === 'true') {
            this._checked = true;
            this.setAttribute('checked', '');
        } else {
            this._checked = false;
            this.removeAttribute('checked');
        }
    }

    static get observedAttributes() {
        return ['checked'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            if (name === "checked") {
                if (newValue === '' || newValue === 'checked' || newValue === 'true') {
                    this._checked = true;
                    this.setAttribute('checked', ''); 
                } else {
                    this._checked = false;
                    this.removeAttribute('checked');
                }
            }
        }
    }
}

window.customElements.define('nwc-toggle-switch', NWCToggleSwitch);