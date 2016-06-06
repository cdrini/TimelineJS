export const time = {
  oneYear: 3.154e+10
};
const EPSILON = 1e-10;

/**
 * Numeric Array.sort function which returns results in ascending order.
 * @param {string} [key] if sorting objects, supply the key to use
 * @example [5,2,1,4].sort(ASC);
 * @example [{x:3},{x:5},{x:1},{x:9}].sort(ASC('x'))
 */
export function ASC(key) {
  if (arguments.length == 2) return arguments[0] - arguments[1];
  else return function(a, b) { return a[key] - b[key]; };
}

/**
 * Numeric Array.sort function which returns results in descending order.
 * @param {string} [key] if sorting objects, supply the key to use
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
 * Check if val is between the given values
 * @param  {number}  val the value to check
 * @param  {number}  lo  the lower boundary
 * @param  {number}  hi  the upper boundary
 * @return {Boolean} If val is between lo and hi
 */
export function isBetween(val, lo, hi) {
  return lo < val && val < hi;
}

/**
 * Check if two values are approximately equal
 * @param  {number} a
 * @param  {number} b
 * @param  {number} [epsilon=EPSILON] definition of 'approximately'. Defaults
 *                                    to a small number.
 * @return {Boolean} Whether a is within epsilon of b
 */
export function approxEqual(a, b, epsilon=EPSILON) {
  return a == b || isBetween(b, a-epsilon, a+epsilon);
}

/**
 * Bound val between lo and hi
 * @param {number} val the number to be bounded
 * @param {number} lo  lower bound
 * @param {number} hi  upper bound
 * @return {number} the bounded number
 */
export function BOUND(val, lo, hi) {
  return Math.max(lo, Math.min(val, hi));
}

/**
 * Change an SVG's viewbox to match it's children
 * @param {D3Select} svg the svg element
 */
export function tightwrapViewBox(svg) {
  const bbox = svg.node().getBBox();
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
 * Calls the given fn on the next animation frame. Fallsback to throttling if
 * requestAnimationFrame is not supported.
 * @param  {Function} fn the thing we want to limit calls to
 * @return {Function} the handler
 */
export function onAnimationFrame(fn) {
  if (!window.requestAnimationFrame) return throttle(fn, 40);
  const handler = function() {
    window.requestAnimationFrame(() => fn.apply(this, arguments));
  };

  return handler;
}

/**
 * Convert a date or timestamp to a timestamp. Falls back to a default value if
 * date is undefined.
 * @param  {Date|number} date the date to convert
 * @param  {number|NaN}  [defDate=NaN] default date to use
 * @return {number} returns NaN on exceptional cases.
 */
export function dateToTimestamp(date, defDate=NaN) {
  if      (typeof date == 'undefined') return defDate;
  else if (typeof date == 'number')    return date;
  else if (date instanceof Date)       return date.getTime();
  else return NaN;
}

/**
 * Converts ms to years
 * @param {number} ms
 * @return {number} years
 */
export function msToYears(ms) {
  return ms / 3.15569e10;
}
