import fontData from './vi_fontdata.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

export class vi_Font {
    // Separate method to load and parse the font data
    static   loadFont() {
        // Create a FontLoader instance
        const loader = new FontLoader();

        // Parse the font data and return the font object
        return loader.parse(fontData);
    }

    // Static method to get the font
    static   getFont() {
        // Load and parse the font data if it hasn't been loaded already
        if (!vi_Font.font) {
            vi_Font.font =   vi_Font.loadFont();
        }

        return vi_Font.font;
    }
}
