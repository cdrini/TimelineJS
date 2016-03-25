export const time = {
  oneYear: 3.154e+10
};

/**
 * @param  {Date|number} [date]
 * @return {number} returns NaN on exceptional cases.
 */
export function dateToTimestamp(date, defDate=NaN) {
  if      (typeof date == 'undefined') return defDate;
  else if (typeof date == 'number')    return date;
  else if (date instanceof Date)       return date.getTime();
  else return NaN;
}

export function makeSVG() {
  return document.createElementNS("http://www.w3.org/2000/svg", "svg");
}

/**
 * Converts ms to years
 * @param {Integer} ms
 * @return {Integer} years
 */
export function msToYears(ms) {
  return ms / 3.15569e10;
}

/**
 * Determine the BBox containing the BBoxes of all els
 * @param  {SVGElement[]} els
 * @return {BBox}
 */
export function extentBBox(els) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for(let i = 0; i < els.length; ++i) {
    const bbox = els[i].getBBox();
    if (bbox.x < minX) minX = bbox.x;
    if (bbox.y < minY) minY = bbox.y;
    if (bbox.x + bbox.width > maxX) maxX = bbox.x + bbox.width;
    if (bbox.y + bbox.height > maxY) maxY = bbox.y + bbox.height;
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}
