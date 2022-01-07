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