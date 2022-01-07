const NWCNumberTemplate = document.createElement('template');
 
NWCNumberTemplate.innerHTML = `
    <style>
        @import url("./components/assets/gui-icons.css");
        :host {
            display: inline-block;
            max-width: max-content;
            max-height: max-content;
            box-sizing: border-box;
        }
        :host([hidden]) {
            display: none;
        }
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
        input[type=number] {
            -moz-appearance: textfield;
        }
        div {
            display: grid;
            height: var(--nwc-number-height);
            grid-template-columns: var(--nwc-number-button-width) min-content var(--nwc-number-button-width);
            grid-template-areas: "decrementBtnArea inputArea incrementBtnArea";
        }
        .number-input {
            grid-area: inputArea;
            width: var(--nwc-number-input-width);
            text-align: center;
            border-radius: 0;
            border: 1px solid var(--nwc-number-input-border-color);
            background-color: var(--nwc-number-input-background-color);
            color: var(--nwc-number-input-foreground-color);
            font-weight: bold;
        }
        .number-input:focus {
            outline: none;
        }
        button {
            border: none;
            border-radius: 0;
            background-color: var(--nwc-number-button-background-color);
            color: var(--nwc-number-button-foreground-color);
            font-size: 10px;
            cursor: pointer;
        }
        button:focus {
            outline: none;
        }
        button.decrement {
            grid-area: decrementBtnArea;
            border-top-left-radius: var(--nwc-number-decrement-border-radius);
            border-bottom-left-radius: var(--nwc-number-decrement-border-radius);
        }
        button.increment {
            grid-area: incrementBtnArea;
            border-top-right-radius: var(--nwc-number-increment-border-radius);
            border-bottom-right-radius: var(--nwc-number-increment-border-radius);
        }
    </style>
    <div>
        <button type="button" class="decrement gui gui-minus"></button>
        <input class="number-input" type="number"/>
        <button type="button" class="increment gui gui-plus"></button>
    </div>
`;
 
class NWCNumber extends HTMLElement {
    constructor() {
        super();
        
        this._minValue = null;
        this._maxValue = null;
        this._stepValue = null;
        this._defaultValue = "0";
        this._value = undefined;
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(NWCNumberTemplate.content.cloneNode(true));
    }
 
    connectedCallback() {
        this._value = this.shadowRoot.querySelector('.number-input').value;
        this.shadowRoot.querySelector('.decrement').addEventListener('click', this._handleDecrementButton.bind(this));
        this.shadowRoot.querySelector('.increment').addEventListener('click', this._handleIncrementButton.bind(this));
        this.shadowRoot.querySelector('.number-input').addEventListener('change', this._handleOnChange.bind(this));

        if (!this.hasAttribute('default')) {
            this.setAttribute('default', this._defaultValue);
        }
    }
 
    disconnectedCallback() {
        this.shadowRoot.querySelector('.decrement').removeEventListener('click', this._handleDecrementButton.bind(this));
        this.shadowRoot.querySelector('.increment').removeEventListener('click', this._handleIncrementButton.bind(this));
        this.shadowRoot.querySelector('.number-input').removeEventListener('change', this._handleOnChange.bind(this));
    }

    _handleDecrementButton(event) {
        const step = (this._stepValue !== null) ? Number(this._stepValue) : 1;
        const min = (this._minValue !== null) ? Number(this._minValue) : null;
        const currentValue = Number(this.shadowRoot.querySelector('.number-input').value);

        if (min !== null) {
            const newValue = ((currentValue - step) > min) ? (currentValue - step) : min;
            this.shadowRoot.querySelector('.number-input').value = newValue.toString();
        } else {
            const newValue = (currentValue - step);
            this.shadowRoot.querySelector('.number-input').value = newValue.toString();
        }
        this._value = this.shadowRoot.querySelector('.number-input').value;
        this.dispatchEvent(new CustomEvent('nwcNumberClicked', {detail:{
            value: this.shadowRoot.querySelector('.number-input').value
        }}))
    }

    _handleIncrementButton(event) {
        const step = (this._stepValue !== null) ? Number(this._stepValue) : 1;
        const max = (this._maxValue !== null) ? Number(this._maxValue) : null;
        const currentValue = Number(this.shadowRoot.querySelector('.number-input').value);
        
        if (max !== null) {
            const newValue = ((currentValue + step) < max) ? (currentValue + step) : max;
            this.shadowRoot.querySelector('.number-input').value = newValue.toString();
        } else {
            const newValue = (currentValue + step);
            this.shadowRoot.querySelector('.number-input').value = newValue.toString();
        }
        this._value = this.shadowRoot.querySelector('.number-input').value;
        this.dispatchEvent(new CustomEvent('nwcNumberClicked', {detail:{
            value: this.shadowRoot.querySelector('.number-input').value
        }}))
    }

    _handleOnChange(event) {
        const min = (this._minValue !== null) ? Number(this._minValue) : null;
        const max = (this._maxValue !== null) ? Number(this._maxValue) : null;
        const currentValue = Number(this.shadowRoot.querySelector('.number-input').value);

        if (min !== null && currentValue < min) {
            this.shadowRoot.querySelector('.number-input').value = min.toString();
        }
        if (max !== null && currentValue > max) {
            this.shadowRoot.querySelector('.number-input').value = max.toString();
        }
        this._value = this.shadowRoot.querySelector('.number-input').value;
        this.dispatchEvent(new CustomEvent('nwcNumberChanged', {detail:{
            value: this.shadowRoot.querySelector('.number-input').value
        }}))
    }

    _adjustInputAttributes(att, value) {
        if (value !== null) {
            if (!this.shadowRoot.querySelector('.number-input').hasAttribute(att)) {
                this.shadowRoot.querySelector('.number-input').setAttribute(att, value);
            }
        } else {
            if (this.shadowRoot.querySelector('.number-input').hasAttribute(att)) {
                this.shadowRoot.querySelector('.number-input').removeAttribute(att);
            }
        }
    }

    _updateInputValue() {
        const pendingValue = Number(this._value);
        if (this._minValue !== null && pendingValue < Number(this._minValue)) {
            this._value = this._minValue;
            this.shadowRoot.querySelector('.number-input').value = this._value;
        } else if (this._maxValue !== null && pendingValue > Number(this._maxValue)) {
            this._value = this._maxValue;
            this.shadowRoot.querySelector('.number-input').value = this._value;
        } else {
            this.shadowRoot.querySelector('.number-input').value = this._value;
        }

        this.shadowRoot.querySelector('.number-input').value = this._value;
    }

    _validNumberCheck(value) {
        return /^-?\d+$/.test(value);
    }



    get step() {
        return this._stepValue;
    }

    set step(value) {
        if (this._validNumberCheck(value)) {
            this._stepValue = Number(value);
            this._adjustInputAttributes('step', this._stepValue);
        }
    }
    get min() {
        return this._stepValue;
    }

    set min(value) {
        if (this._validNumberCheck(value)) {
            this._minValue = Number(value);
            this._adjustInputAttributes('min', this._minValue);
        }
    }
    get max() {
        return this._stepValue;
    }

    set max(value) {
        if (this._validNumberCheck(value)) {
            this._maxValue = Number(value);
            this._adjustInputAttributes('max', this._maxValue);
        }
    }
    get default() {
        return this._defaultValue;
    }

    set default(value) {
        if (this._validNumberCheck(value)) {
            this._defaultValue = Number(value);
            this._adjustInputAttributes('value', this._defaultValue);
        }
    }

    get value() {
        return this._value;
    }

    set value(value) {
        if (this._validNumberCheck(value)) {
            this._value = Number(value);
            this._updateInputValue();
        }
    }


 
    static get observedAttributes() {
        return ['step', 'min', 'max', 'default'];
    }
 
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            if (name === 'step') {
                if (this._validNumberCheck(newValue)) {
                    this._stepValue = Number(newValue);
                    this._adjustInputAttributes('step', this._stepValue);
                } else {
                    this._defaultValue = newValue;
                    this.removeAttribute('step');
                    if (this.shadowRoot.querySelector('.number-input').hasAttribute) {this.shadowRoot.querySelector('.number-input').removeAttribute('step');}
                }
            } else if (name === 'min') {
                if (this._validNumberCheck(newValue)) {
                    this._minValue = Number(newValue);
                    this._adjustInputAttributes('min', this._minValue);
                } else {
                    this._minValue = newValue;
                    this.removeAttribute('min');
                    if (this.shadowRoot.querySelector('.number-input').hasAttribute) {this.shadowRoot.querySelector('.number-input').removeAttribute('min');}
                }
            } else if (name === 'max') {
                if (this._validNumberCheck(newValue)) {
                    this._maxValue = Number(newValue);
                    this._adjustInputAttributes('max', this._maxValue);
                } else {
                    this._maxValue = newValue;
                    this.removeAttribute('max');
                    if (this.shadowRoot.querySelector('.number-input').hasAttribute) {this.shadowRoot.querySelector('.number-input').removeAttribute('max');}
                }
            } else if (name === 'default') {
                if (this._validNumberCheck(newValue)) {
                    this._defaultValue = Number(newValue);
                    this._adjustInputAttributes('value', this._defaultValue);
                }else {
                    this._defaultValue = newValue;
                    this.removeAttribute('default');
                    if (this.shadowRoot.querySelector('.number-input').hasAttribute) {this.shadowRoot.querySelector('.number-input').removeAttribute('value');}
                }
            }
        }
    }
}
 
window.customElements.define('nwc-number', NWCNumber);