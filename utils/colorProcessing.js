import { eventBus } from './eventBus.js'

// Themes for different pages
export const colorArrays = {
    home: {
        color1: '#1d0a89',
        color2: '#6a0373',
        color3: '#24c6dc',
        color4: '#231126',
    },
    download: {
        color1: '#2bacdf',
        color2: '#0004e0',
        color3: '#6d19a5',
        color4: '#680087',
    },
    settings: {
        color1: '#8415a3',
        color2: '#7a0202',
        color3: '#a5197d',
        color4: '#320616',
    },
    massInstall: {
        color1: '#280335',
        color2: '#4e4e4e',
        color3: '#464646',
        color4: '#540723',
    },
    profiles: {
        color1: '#803700',
        color2: '#3d0126',
        color3: '#6d19a5',
        color4: '#310087',
    },
}

// Helper: Convert hex string to {r, g, b}
function hexToRgb(hex) {
    // Remove the hash if present
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }
    const num = parseInt(hex, 16);
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
    };
}

// Helper: Convert {r, g, b} back to hex string
function rgbToHex({ r, g, b }) {
    return '#' + [r, g, b]
        .map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        })
        .join('');
}

// Helper: Interpolate between two hex colors given a factor (0 to 1)
export function interpolateColor(hex1, hex2, factor) {
    const c1 = hexToRgb(hex1);
    const c2 = hexToRgb(hex2);
    const r = Math.round(c1.r + (c2.r - c1.r) * factor);
    const g = Math.round(c1.g + (c2.g - c1.g) * factor);
    const b = Math.round(c1.b + (c2.b - c1.b) * factor);
    return rgbToHex({ r, g, b });
}

export function changeBackground(page) {
    eventBus.emit('set-colors', colorArrays[page]);
}
