import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import iconData from './vi_icondata.js';


export class vi_Icon {
    // Separate method to load and parse the SVG icon data
    static loadIcon(icondata) {
        // Create a SVGLoader instance
        const loader = new SVGLoader();

        // Parse the SVG data and return the SVG object
        return loader.parse(icondata);
    }

    // Static method to get the SVG icon
    static getIcon() {
        // Your SVG icon data (replace with your SVG data)
        const icon = iconData;

        // Load and parse the SVG icon data if it hasn't been loaded already
        if (!vi_Icon.icon) {
            vi_Icon.icon = vi_Icon.loadIcon(icon);
        }

        return vi_Icon.icon;
    }
}