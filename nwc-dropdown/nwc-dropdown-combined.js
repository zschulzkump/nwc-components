// #region | NWC Dropdown |

const NWCDropdownTemplate = document.createElement('template');

NWCDropdownTemplate.innerHTML = `
    <style>
        @import url("./components/assets/gui-icons.css");
        :host {
            display: inline-block;
            vertical-align: middle;
            position: relative;
        }
        :host([hidden]) {
            display: none;
        }
        ::slotted(nwc-dropdown-menu) {
            display: none;
            position: absolute;
            z-index: 50;
        }
        .nwc-ico {
            font-size: 16px;
        }
        .nwc-dropdown-button {
            user-select: none;
            width: max-content;
            height: 30px;
            display: grid;
            grid-template-columns: auto 30px;
            grid-template-areas: "textArea caretArea";
            background-color: var(--nwc-dropdown-button-background-color);
            color: var(--nwc-dropdown-button-foreground-color);
            cursor: pointer;
            box-sizing: border-box;
            z-index: 40;
        }
        .nwc-dropdown-button:hover {
            background-color: var(--nwc-dropdown-button-background-color-hover);
            color: var(--nwc-dropdown-button-foreground-color-hover);
        }
        .nwc-dropdown-button-text {
            grid-area: textArea;
            justify-self: center;
            align-self: center;
            user-select: none;
            padding-left: 10px;
            padding-right: 5px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            box-sizing: border-box;
        }
        .nwc-dropdown-button-caret {
            grid-area: caretArea;
            justify-self: center;
            align-self: center;
            user-select: none;
            box-sizing: border-box;
        }
    </style>
    <div part="base" class="nwc-dropdown-button">
        <span class="nwc-dropdown-button-caret gui gui-menu-ellipsis"></span>
    </div>
    <slot name="nwc-dropdown-panel"></slot>
`;

class NWCDropdown extends HTMLElement {
    constructor() {
        super();

        this._text = null;
        this._open = null;
        this._panelAlignment = '0';
        this._panelDistance = 0;
        this._boundingBox = 'window';
        this._noClose = null;
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(NWCDropdownTemplate.content.cloneNode(true));
    }

    connectedCallback() {

        this.shadowRoot.querySelector('.nwc-dropdown-button').addEventListener('click', this._triggerClicked.bind(this));
        document.addEventListener('keydown', this._handleDocumentKeyDown.bind(this), true);
        document.addEventListener('mouseup', this._handleDocumentMouseUp.bind(this), true);
        this.addEventListener('nwcDropdownItemClicked', this._handleMenuItemClicked.bind(this), true);
        this.addEventListener('nwcDropdownSelectItemClicked', this._handleMenuSelectItemClicked.bind(this), true);

        if (!this.hasAttribute('panel-alignment')) {
            this.setAttribute('panel-alignment', this._panelAlignment);
        }
        if (!this.hasAttribute('panel-distance')) {
            this.setAttribute('panel-distance', this._panelDistance);
        }
        if (!this.hasAttribute('panel-alignment')) {
            this.setAttribute('bounding-box', this._boundingBox);
        }
    }

    disconnectedCallback() {

        this.shadowRoot.querySelector('.nwc-dropdown-button').removeEventListener('click', this._triggerClicked.bind(this));
        document.removeEventListener('keydown', this._handleDocumentKeyDown.bind(this), true);
        document.removeEventListener('mouseup', this._handleDocumentMouseUp.bind(this), true);
        this.removeEventListener('nwcDropdownItemClicked', this._handleMenuItemClicked.bind(this), true);
        this.removeEventListener('nwcDropdownSelectItemClicked', this._handleMenuSelectItemClicked.bind(this), true);

    }

    _handleDocumentKeyDown(event) {
        if (this.hasAttribute('open') && event.key === 'Escape'){
            this._closePanel();
        }
    }

    _handleDocumentMouseUp(event) {
        const path = event.composedPath();
        if (this.hasAttribute('open') && !path.includes(this)) {
            this._closePanel();
        }
    }

    _handleMenuSelectItemClicked(e) {
        const itemClickedText = e.detail.dropdownItem;
        const menuSelectItems = e.target.parentElement.children;

        for (const selectItem of menuSelectItems) {
            if ((selectItem.group === null) && (e.detail.dropdownItemGroup === null)) {
                if (!selectItem.checked) {
                    selectItem.checked = true;
                } else {
                    selectItem.checked = false;
                }
            } else {
                if (selectItem.group === e.detail.dropdownItemGroup) {
                    selectItem.checked = false;
                    if (selectItem.text.toLowerCase() === itemClickedText) {
                        selectItem.checked = true;
                    }
                }
            }
        }
        if (!this.hasAttribute('no-close')) {
            this._closePanel()
        }
    }

    _handleMenuItemClicked() {
        if (!this.hasAttribute('no-close')) {
            this._closePanel()
        }
    }

    _updateText() {
        if (this.shadowRoot.querySelector(".nwc-dropdown-button-text")) {
            this.shadowRoot.querySelector(".nwc-dropdown-button-text").textContent = this._text;
        } else {
            let dropdownText = document.createElement('span');
            dropdownText.className = 'nwc-dropdown-button-text';
            dropdownText.setAttribute('part', 'text'); 
            dropdownText.textContent = this._text;
            this.shadowRoot.querySelector(".nwc-dropdown-button").appendChild(dropdownText);
        }
        
    }

    hidePanel() {
        this._closePanel();
    }

    _closePanel() {
        if (this.hasAttribute('open')) {

            this.removeAttribute('open');
        }
        if (this.querySelector('nwc-dropdown-menu')) {
            this.querySelector('nwc-dropdown-menu').style.top = this.getBoundingClientRect().height+"px";
            this.querySelector('nwc-dropdown-menu').style.display = 'none';
        }
    }
    
    _determinePanel_X_Coordinate(dropdownButtonRect, dropdownMenuRect, adjusted = null) {

        if (this.querySelector("nwc-dropdown-menu")) {
            let x = null;
            if (this._panelAlignment === 'left' && adjusted === null) {
                x = (dropdownMenuRect.left - dropdownButtonRect.left);
            } else if (this._panelAlignment === 'right' && adjusted === null) {
                x = -(Math.abs(dropdownMenuRect.width - dropdownButtonRect.width));
            } else if (this._panelAlignment === 'center' && adjusted === null) {
                x = -(Math.abs((dropdownMenuRect.width - dropdownButtonRect.width) / 2));
            } else if (!isNaN(this._panelAlignment)) {
                x = (this._panelAlignment);
            } else if (adjusted === 'left' && (this._panelAlignment === 'left' || this._panelAlignment === 'right' || this._panelAlignment === 'center' || !isNaN(this._panelAlignment))) {
                x = -dropdownMenuRect.width;
            } else if (adjusted === 'right' && (this._panelAlignment === 'left' || this._panelAlignment === 'right' || this._panelAlignment === 'center' || !isNaN(this._panelAlignment))) {
                x = dropdownMenuRect.width;
            }
            return x;
        }    
    }

    _determinePanel_Y_Coordinate(BoundingBoxTop, BoundingBoxHeight, dropdownButtonRect, dropdownMenuRect, flipped = false, adjusted = null) {

        let y = null;
        if (!flipped && adjusted === null) {

            y = dropdownButtonRect.height;

        } else if (flipped && adjusted === null) {

            y = dropdownMenuRect.height;

        } else if (!flipped && (adjusted === 'left' || adjusted === 'right')) {
            const MenuBottomToBoundingBoxBottom = (BoundingBoxHeight - ((dropdownMenuRect.top - BoundingBoxTop) + (dropdownMenuRect.height + 4)));

            if ((MenuBottomToBoundingBoxBottom + dropdownButtonRect.height >= 0)) {

                y = (dropdownButtonRect.height - dropdownButtonRect.height);

            } else if ((MenuBottomToBoundingBoxBottom + dropdownButtonRect.height < 0)) {

                y = (MenuBottomToBoundingBoxBottom + dropdownButtonRect.height);

            }

        }

        return (this._panelDistance === 0 && adjusted === null) ? y 
        : (this._panelDistance !== 0 && adjusted === null) ? (y + this._panelDistance)
        : y;
    }

    _determineBoundingBox() {
        return (this._boundingBox !== 'window') ? document.querySelector("#"+this._boundingBox) : window;
    }

    _determinePanelLocation() {
        const boundingBox = this._determineBoundingBox();
        this.querySelector('nwc-dropdown-menu').style.visibility = 'hidden';
        this.querySelector('nwc-dropdown-menu').style.display = 'block';

        const dropdownButtonRect = this.getBoundingClientRect();
        const dropdownMenuRect = this.querySelector('nwc-dropdown-menu').getBoundingClientRect();

        let BoundingBoxTop = null;
        let BoundingBoxLeft = null;
        let BoundingBoxHeight = null;
        let BoundingBoxWidth = null;

        if (boundingBox.self !== window) {
            BoundingBoxTop = boundingBox.getBoundingClientRect().top;
            BoundingBoxLeft = boundingBox.getBoundingClientRect().left;
            BoundingBoxHeight = boundingBox.getBoundingClientRect().height;
            BoundingBoxWidth = boundingBox.getBoundingClientRect().width;           
        } else {
            BoundingBoxTop = window.pageYOffset;
            BoundingBoxLeft = window.pageXOffset;
            BoundingBoxHeight = window.innerHeight;
            BoundingBoxWidth = window.innerWidth;
        }

        this.querySelector('nwc-dropdown-menu').style.display = 'none';
        this.querySelector('nwc-dropdown-menu').style.visibility = 'visible';

        let x = null;
        let y = null;
        let insufficientRoom = false;

        if (dropdownMenuRect.height > BoundingBoxHeight) {
            console.log("Not enough room to open menu");
            insufficientRoom = true;
        } else if ((BoundingBoxHeight - ((dropdownMenuRect.top - BoundingBoxTop) + dropdownMenuRect.height + this._panelDistance)) >= 0) {
            
            x = this._determinePanel_X_Coordinate(dropdownButtonRect, dropdownMenuRect);
            y = this._determinePanel_Y_Coordinate(BoundingBoxTop, BoundingBoxHeight, dropdownButtonRect, dropdownMenuRect);

            
        } else if ((dropdownMenuRect.top - BoundingBoxTop) >= ((dropdownMenuRect.height + this._panelDistance) + dropdownButtonRect.height)) {
            
            x = this._determinePanel_X_Coordinate(dropdownButtonRect, dropdownMenuRect);
            y = -this._determinePanel_Y_Coordinate(BoundingBoxTop, BoundingBoxHeight, dropdownButtonRect, dropdownMenuRect, true);

        } else if (((dropdownMenuRect.left - BoundingBoxLeft) > (dropdownMenuRect.width + dropdownButtonRect.width))) {
            
            x = this._determinePanel_X_Coordinate(dropdownButtonRect, dropdownMenuRect, 'left');
            y = this._determinePanel_Y_Coordinate(BoundingBoxTop, BoundingBoxHeight, dropdownButtonRect, dropdownMenuRect,  false, 'left');

        } else if (((BoundingBoxWidth - (dropdownMenuRect.right - BoundingBoxLeft)) > (dropdownMenuRect.width + dropdownButtonRect.width))) {
            
            x = this._determinePanel_X_Coordinate(dropdownButtonRect, dropdownMenuRect, 'right');
            y = this._determinePanel_Y_Coordinate(BoundingBoxTop, BoundingBoxHeight, dropdownButtonRect, dropdownMenuRect, false, 'right');

        }

        return (!insufficientRoom) ? {"x": x, "y": y} : null;
    }

    _openPanel() {
        if (!this.hasAttribute('open')) {
            this.setAttribute('open', '');
        }
        if (this.querySelector('nwc-dropdown-menu')) {

            const panelCoordinates = this._determinePanelLocation();

            if (panelCoordinates !== null) {
                this.querySelector('nwc-dropdown-menu').style.left = panelCoordinates.x + "px";
                this.querySelector('nwc-dropdown-menu').style.top = panelCoordinates.y + "px";
                this.querySelector('nwc-dropdown-menu').style.display = 'block';
            } else {
                console.log("Can not display menu, window is too small.");
            }
        }
    }

    _triggerClicked() {
        if (!this.hasAttribute('open')) {
            this._openPanel();
        } else {
            this._closePanel();
        }
    }

    get text() {
        return this._text;
    }
    set text(Value) {
        if (Value !== this._text) {
            this._text = Value;
            if (Value !== null) {
                this.setAttribute('content', Value);
                this._updateText();
            } else {
                this.removeAttribute('content');
            }

        }
    }

    get PanelAlignment() {
        return this._panelAlignment;
    }
    set PanelAlignment(Value) {
        Value = Value.trim().toLowerCase();
        this._panelAlignment = Value;
        this.setAttribute('panel-alignment', Value);
    }

    get boundingBox() {
        return this._boundingBox;
    }
    set boundingBox(Value) {
        Value = Value.trim();
        this._boundingBox = Value;
        this.setAttribute('bounding-box', Value);
    } 

    get panelDistance() {
        return this._panelDistance;
    }
    set panelDistance(Value) {
        Value = Value.trim();
        this._panelDistance = Number(Value);
        this.setAttribute('panel-distance', Number(Value));
    }  

    static get observedAttributes() {
        return ["content", "panel-alignment", "panel-distance", "bounding-box"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            if (name === "content") {
                this._text = newValue;
                this._updateText();
            } else if (name === "panel-alignment") {
                this._panelAlignment = newValue;
            } else if (name === "panel-distance") {
                this._panelDistance = Number(newValue);
            } else if (name === "bounding-box") {
                this._boundingBox = newValue;
            }
        }
    }
}

window.customElements.define('nwc-dropdown', NWCDropdown)

// #endregion | NWC Dropdown |

// #region | NWC Dropdown Menu |

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

// #endregion | NWC Dropdown Menu |

// #region | NWC Dropdown Item |

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
            display: block;
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

        this._content = '';
        this._textAlign = 'left';
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(NWCDropdownItemTemplate.content.cloneNode(true));
    }

    connectedCallback() {

        this.shadowRoot.querySelector('.nwc-dropdown-item').addEventListener('click', this._createNWCDropdownItemClicked.bind(this))

        if (!this.hasAttribute('content')) {
            this.setAttribute('content', this._content);
        }
        if (!this.hasAttribute('text-align')) {
            this.setAttribute('text-align', this._textAlign);
        }
        if (!this.hasAttribute('slot')) {
            this.setAttribute('slot', 'nwc-dropdown-menu');
        }

        this._updateContent();
    }

    disconnectedCallback() {
        this.shadowRoot.querySelector('.nwc-dropdown-item').removeEventListener('click', this._createNWCDropdownItemClicked.bind(this))
    }

    _createNWCDropdownItemClicked() {
        this.dispatchEvent(new CustomEvent('nwcDropdownItemClicked', {
            detail:{
            dropdownItem: this._content.trim().toLowerCase()
            },
            bubbles: true,
            cancelable: false,
            composed: true
        }))
    }

    _updateTextAlign() {
        this.shadowRoot.querySelector(".nwc-dropdown-item-text").style.textAlign = this._textAlign.trim().toString();
    }

    _updateContent() {
        this.shadowRoot.querySelector(".nwc-dropdown-item-text").textContent = this._content;
    }

    get content() {
        return this._content;
    }
    set content(Value) {
        this._content = Value;
        this.setAttribute('content', Value);
        this._updateContent();
    }

    get textAlign() {
        return this._textAlign;
    }
    set textAlign(Value) {
        this._textAlign = Value;
        this.setAttribute('text-align', Value);
        this._updateTextAlign();
    }

    static get observedAttributes() {
        return ["content", "text-align"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            if (name === "content") {
                this._content = newValue; 
                this._updateContent();
            } else if (name === "text-align") {
                this._textAlign = newValue; 
                this._updateTextAlign();
            }
        }
    }
}

window.customElements.define('nwc-dropdown-item', NWCDropdownItem)

// #endregion | NWC Dropdown Item |

// #region | NWC Dropdown Select Item |

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
        :host([checked]) .checkmark {
            color: var(--nwc-dropdown-select-item-foreground-color-checked);
        }
        .nwc-dropdown-item {
            user-select: none;
            padding-top: 10px;
            padding-bottom: 10px;
            padding-left: 10px;
            padding-right: 10px;
            height: min-content;
            cursor: pointer;
            display: grid;
            grid-template-columns: 30px 1fr;
            grid-template-areas: "checkArea textArea";
            background-color: var(--nwc-dropdown-item-background-color);
            color: var(--nwc-dropdown-item-foreground-color);            
        }
        .nwc-dropdown-item:hover {
            background-color: var(--nwc-dropdown-item-background-color-hover);
        }
        .checkmark {
            grid-area: checkArea;
            margin-right: 10px;
            justify-self: center;
            align-self: center;
            padding-left: 10px;
            padding-right: 10px;
            color: var(--nwc-dropdown-select-item-foreground-color-unchecked);
        }
        .nwc-dropdown-item-text {
            grid-area: textArea;
            justify-self: left;
            align-self: center;
            user-select: none;
            padding-left: 10px;
            padding-right: 10px;
            border-left: 1px solid var(--nwc-dropdown-select-item-check-text-divider-color);
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
        this._group = null;
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(NWCDropdownSelectItemTemplate.content.cloneNode(true));
    }

    connectedCallback() {

        this.shadowRoot.querySelector('.nwc-dropdown-item').addEventListener('click', this._createNWCDropdownSelectItemClicked.bind(this))

        if (!this.hasAttribute('content')) {
            this.setAttribute('content', this._text);
        }
        if (!this.hasAttribute('slot')) {
            if (this.parentElement.tagName === "NWC-DROPDOWN-MENU") {
                this.setAttribute('slot', 'nwc-dropdown-menu');
            } else if (this.parentElement.tagName === "NWC-DROPDOWN-MENU-GROUP") {
                this.setAttribute('slot', 'nwc-dropdown-menu-group');
            }
        }

        this._addText();
    }

    disconnectedCallback() {
        this.shadowRoot.querySelector('.nwc-dropdown-item').removeEventListener('click', this._createNWCDropdownSelectItemClicked.bind(this))
    }

    _createNWCDropdownSelectItemClicked() {
        this.dispatchEvent(new CustomEvent('nwcDropdownSelectItemClicked', {
            detail:{
            dropdownItemChecked: this._checked,
            dropdownItemGroup: this._group,
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
        if (Value === '' || Value === 'checked' || Value === 'true' || Value === true) {
            this._checked = true;
            this.setAttribute('checked', '');
        } else {
            this._checked = false;
            this.removeAttribute('checked');
        }
    }

    get group() {
        return this._group;
    }
    set group(Value) {
        if (Value !== '') {
            this._group = Value.trim();
            this.setAttribute('group', Value.trim());
        } else {
            this._group = null;
            this.removeAttribute('group');
        }
    }

    static get observedAttributes() {
        return ["content", "checked", "group"];
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
            } else if (name === "group") {
                if (newValue !== '') {
                    this._group = newValue.trim();
                    this.setAttribute('group', newValue.trim());
                } else {
                    this._group = null;
                    this.removeAttribute('group');
                }
            }
        }
    }
}

window.customElements.define('nwc-dropdown-select-item', NWCDropdownSelectItem)

// #endregion | NWC Dropdown Select Item |

// #region | NWC Dropdown Divider |

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

// #endregion | NWC Dropdown Divider |

// #region | NWC Dropdown Menu Group |

const NWCDropdownMenuGroupTemplate = document.createElement('template');

NWCDropdownMenuGroupTemplate.innerHTML = `
    <style>
        :host {
            display: block;
            width: 100%;
            height: max-content;
            box-sizing: border-box;

        }
        :host([hidden]) {
            display: none;
        }
        ::slotted(nwc-dropdown-select-item:nth-of-type(n+2))::before {
            content: '';
            display: block;
            border-top: 1px solid var(--nwc-dropdown-select-item-border-color);
        }
        .nwc-dropdown-menu-group {
            user-select: none;
            padding-top: 5px;
            padding-bottom: 5px;
            display: grid;
            grid-template-rows: min-content 1fr;
            grid-template-areas: 
                "HeaderArea"
                "ItemsArea";
            background-color: var(--nwc-dropdown-menu-background-color);
            box-sizing: border-box;
            
        }
        .nwc-dropdown-menu-group-header-container {
            grid-area: HeaderArea;
            display: inline-grid;
            padding-bottom: 5px;
            border-bottom: 1px solid var(--nwc-dropdown-menu-group-header-separator-color);
        }
        .nwc-dropdown-menu-group-header {
            justify-self: center;
            align-self: center;
            font-size: 16px;
            font-weight: bold;
            color: var(--nwc-dropdown-menu-group-header-color);
        }
        .nwc-dropdown-menu-group-items-container {
            grid-area: ItemsArea;
        }
    </style>
    <div part="base" class="nwc-dropdown-menu-group">
        <div class="nwc-dropdown-menu-group-header-container">
            <span class="nwc-dropdown-menu-group-header" part="text"></span>
        </div>
        <div class="nwc-dropdown-menu-group-items-container">
            <slot name="nwc-dropdown-menu-group"></slot>
        </div>
    </div>
`;

class NWCDropdownMenuGroup extends HTMLElement {
    constructor() {
        super();

        this._content = '';
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(NWCDropdownMenuGroupTemplate.content.cloneNode(true));
    }

    connectedCallback() {
        if (!this.hasAttribute('slot')) {
            this.setAttribute('slot', 'nwc-dropdown-menu');
        }

    }

    _updateText() {
        if (this.shadowRoot.querySelector('.nwc-dropdown-menu-group-header')) {
            this.shadowRoot.querySelector('.nwc-dropdown-menu-group-header').textContent = this._content;
        }
    }
    
    get content() {
        return this._content;
    }
    set content(Value) {
        if (Value !== '') {
            this._content = Value.trim();
            this.setAttribute('content', Value.trim());
        } else {
            this._content = null;
            this.removeAttribute('content');
        }
        this._updateText();
    }

    static get observedAttributes() {
        return ["content"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            if (name === "content") {
                if (newValue !== '') {
                    this._content = newValue.trim();
                    this.setAttribute('content', newValue.trim());
                } else {
                    this._content = null;
                    this.removeAttribute('content');
                }
                this._updateText();
            }
        }
    }


}

window.customElements.define('nwc-dropdown-menu-group', NWCDropdownMenuGroup)

// #endregion | NWC Dropdown Menu Group |
