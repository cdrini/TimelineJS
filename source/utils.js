export const time = {
  oneYear: 3.154e+10
};

/**
 * Numeric Array.sort function which returns results in ascending order.
 * @param {String} [key] if sorting objects, supply the key to use
 * @example [5,2,1,4].sort(ASC);
 * @example [{x:3},{x:5},{x:1},{x:9}].sort(ASC('x'))
 */
export function ASC(key) {
  if (arguments.length == 2) return arguments[0] - arguments[1];
  else return function(a, b) { return a[key] - b[key]; };
}

/**
 * Numeric Array.sort function which returns results in descending order.
 * @param {String} [key] if sorting objects, supply the key to use
 * @example [5,2,1,4].sort(DESC);
 * @example [{x:3},{x:5},{x:1},{x:9}].sort(DESC('x'))
 */
export function DESC(key) {
  if (arguments.length == 2) return arguments[1] - arguments[0];
  else return function(a, b) { return b[key] - a[key]; };
}

/**
 * Returns what you give
 * @param  {*} x
 * @return {*}
 * @example [null, false, true, 34].filter(identity) == [true,34]
 */
export function identity(x) {
  return x;
}

/**
 * Bound val between lo and hi
 * @param {Number} val the number to be bounded
 * @param {Number} lo  lower bound
 * @param {Number} hi  upper bound
 * @return {Number} the bounded number
 */
export function BOUND(val, lo, hi) {
  return Math.max(lo, Math.min(val, hi));
}

/**
 * Change an SVG's viewbox to match it's children
 * @param  {D3Select} svg the svg element
 */
export function tightwrapViewBox(svg) {
  const bbox = extentBBox(svg.node().children);
  for(const k in bbox) bbox[k] = bbox[k].toFixed(2);
  svg.attr({
    viewBox: `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`,
    width: bbox.width,
    height: bbox.height
  });
}

/**
 * Ensures the provided function is never executed more than once every 50 ms
 * (or whatever is provided). Useful as a scroll/resize event handler wrapper.
 * @param  {Function} fn      the thing we want to limit calls to
 * @param  {number}   [ms=50] how frequently the fn can be executed
 * @return {Function}         the handler
 */
export function throttle(fn, ms=50) {
  let timer = null;
  let context = this,
      args = [];
  const clear = () => {
    clearTimeout(timer);
    timer = null;
  };
  const handler = function() {
    context = this;
    args = arguments;
    if(!timer) {
      fn.apply(context, args);
      timer = setTimeout(clear, ms);
    }
  };

  return handler;
}

/**
 * Calls the given fn on the next animation frame.
 * @param  {Function} fn      the thing we want to limit calls to
 * @return {Function}         the handler
 */
export function onAnimationFrame(fn) {
  if (!window.requestAnimationFrame) return throttle(fn, 40);
  const handler = function() {
    window.requestAnimationFrame(() => fn.apply(this, arguments));
  };

  return handler;
}

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
