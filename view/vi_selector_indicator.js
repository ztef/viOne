import * as THREE from 'three';

class SelectionIndicator {
    constructor(scene, container) {


        this.container = container;
        // Create the wrapper element
        this._element = document.createElement('div');
        this._element.className = 'selection-wrapper';
        this._element.style.position = 'absolute';
        this._element.style.visibility = 'hidden'; // Initially hidden
        this.container.appendChild(this._element);

        // Create the SVG element
        this._svgNS = 'http://www.w3.org/2000/svg';
        this._svg = document.createElementNS(this._svgNS, 'svg');
        this._svg.setAttribute('width', '160');
        this._svg.setAttribute('height', '160');
        this._svg.setAttribute('viewBox', '0 0 160 160');
        this._element.appendChild(this._svg);

        // Create the path element
        this._path = document.createElementNS(this._svgNS, 'path');
        
        this._path.setAttribute('d', "M 0 0 L 0 22.75 L 4 18.75 L 4 3.75 L 18.75 3.75 L 22.75 0 L 0 0 z M 45.25 0 L 49.25 3.75 L 64 3.75 L 64 18.75 L 68 22.75 L 68 0 L 45.25 0 z M 0 45.25 L 0 68 L 22.75 68 L 18.75 64 L 3.75 64 L 3.75 49.25 L 0 45.25 z M  64 45.25 L 64 64 L 49.25 64 L 45.25 68 L 68 68 L 68 45.25 z");
        this._svg.appendChild(this._path);

        this._scene = scene;
        this._isVisible = false;
        this._screenPositionX = 0;
        this._screenPositionY = 0;

        // Bind view model properties
        this._viewModel = {
            _screenPositionX: this._screenPositionX + 'px',
            _screenPositionY: this._screenPositionY + 'px',
            isVisible: this._isVisible,
            _transform: 'translate(0, 0)' // You may need to adjust the transform
        };
    }

    // Update the position of the indicator
    updatePosition(screenX, screenY) {
        this._screenPositionX = screenX;
        this._screenPositionY = screenY+50;

        this._element.style.left = this._screenPositionX + 'px';
        this._element.style.top = this._screenPositionY + 'px';
    }

    // Show the indicator
    show() {
        this._element.style.visibility = 'visible';
    }

    // Hide the indicator
    hide() {
        this._element.style.visibility = 'hidden';
    }

    // Set visibility based on a boolean value
    setVisibility(isVisible) {
        this._isVisible = isVisible;
        this._viewModel.isVisible = isVisible;
    }

    // Update the path of the indicator
    updatePath(path) {
        this._path.setAttribute('d', path);
    }

    // Destroy the indicator
    destroy() {
        document.body.removeChild(this._element);
    }
}

export default SelectionIndicator;
