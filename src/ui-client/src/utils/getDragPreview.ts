/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

function getTextWidth(ctx: any, style: any, text: string) {
    if (typeof ctx.measureText === 'function') {
        return ctx.measureText(text).width;
    } else {
        const perCharWidth = style.fontSize / 1.7;
        return text.length * perCharWidth;
    }
}
  
function parseBoxShadow(style: any) {
    const parts = (style.boxShadow || '').replace(/px/g, '').split(/[^,] /);
    const offsetX = parts[0];
    const offsetY = parts[1];
    const blur = parts[2];
    const color = parts[3];
    return {
        shadowBlur: parseInt(blur, 10) || 8,
        shadowColor: color || 'rgb(100,100,100)',
        shadowOffsetX: parseInt(offsetX, 10) || 0,
        shadowOffsetY: parseInt(offsetY, 10) || 0
    }
}
  
const defaultStyle = {
    backgroundColor: 'rgb(250,250,250)',
    borderColor: 'transparent',
    color: 'rgb(28, 168, 221)',
    fontSize: 14,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10
};
  
export default function createDragPreview(rawText: string) {
    const text = rawText.length > 30 ? rawText.slice(0, 30) + '...' : rawText;
    const style = defaultStyle;
    const img = new Image();
    const shadowStyle = parseBoxShadow(style);
    const marginBottom = shadowStyle.shadowOffsetY + (shadowStyle.shadowBlur * 2);
    const marginRight = shadowStyle.shadowOffsetX + (shadowStyle.shadowBlur * 2);
    const rectHeight = style.paddingTop + style.fontSize + style.paddingBottom;
    const rectStrokeWidth = 1;
    const c = document.createElement('canvas');
    c.height = rectHeight + marginBottom;
    const ctx = c.getContext('2d')!;
    ctx.font = style.fontSize + 'px Roboto';
    const textWidth = getTextWidth(ctx, style, text);
    const rectWidth = style.paddingLeft + textWidth + style.paddingRight;
    ctx.canvas.width = style.paddingLeft + textWidth + style.paddingRight + marginRight + (rectStrokeWidth * 2);
    ctx.font = style.fontSize + 'px Roboto'; 

    ctx.rect(0, 0, rectWidth, rectHeight);
    ctx.save();
    ctx.fillStyle = style.backgroundColor;
    ctx.strokeStyle = style.borderColor;
    ctx.shadowColor = shadowStyle.shadowColor;
    ctx.shadowBlur = shadowStyle.shadowBlur;
    ctx.shadowOffsetX = shadowStyle.shadowOffsetX;
    ctx.shadowOffsetY = shadowStyle.shadowOffsetY;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = style.color;
    ctx.fillText(text, style.paddingLeft, (style.paddingTop * .75) + style.fontSize);
    img.src = c.toDataURL();
  
    return img;
  }
  