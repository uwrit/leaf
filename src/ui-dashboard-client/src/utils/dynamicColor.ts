import { RgbValues } from "../models/config/content";

const defaultColor: RgbValues = [36, 77, 138];

export const dynamicColor = (rgb?: RgbValues, transparent?: number): string => {
    let vals: any;

    if (typeof(rgb) === 'undefined') {
        vals = defaultColor;
    } else {
        vals = rgb.slice();
    }

    if (typeof(transparent) != 'undefined') {
        vals.push(transparent);
    }

    return `rgb(${vals.join(',')}`;
}