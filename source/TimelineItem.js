import {dateToTimestamp} from "./utils";

/************************* Constants *************************/
const XMLNS = "http://www.w3.org/2000/svg";
const ITEM_TYPES = {
  Invalid: -1,
  Range:    1,
  Point:    2
};
const ACCESSORS = {
  start: item => dateToTimestamp(item.start),
  end:   item => dateToTimestamp(item.end, Date.now()),
  title: item => item.title,
  link:  item => item.link
};

/************************* Public Classes *************************/
export class ItemAccessor {
  constructor() {
    Object.assign(this, ACCESSORS);
  }

  define(newAccessors) {
    for(let k in newAccessors) {
      if (!ACCESSORS[k]) throw `Unrecognized item accessor '${k}'`;
      else this[k] = newAccessors[k];
    }
  }
}

/************************* Public Rendering *************************/
/**
 * Build a timeline item's container
 * @param  {Object}       d         timeline item
 * @param  {ItemAccessor} accessors
 * @return {SVGElement}
 */
export function buildItemContainer(d, accessors) {
  if (accessors.link(d)) {
    return d3.select(document.createElementNS(XMLNS, 'a'))
      .attr({
        'xlink:href': accessors.link(d),
        'xlink:show': 'new'
      }).node();
  } else {
    return document.createElementNS(XMLNS, 'g');
  }
}

/**
 * Draw a timeline item in the specified parent element
 * @param  {Object}        item      timeline item
 * @param  {ItemAccessor}  accessors
 * @param  {SVGElement}    group
 * @param  {Object}        opts
 */
export function drawItem(item, accessors, group, scale, opts) {
  const type = itemType(item, accessors);
  switch(type) {
    case ITEM_TYPES.Range: return drawRangeItem(...arguments);
    case ITEM_TYPES.Point: return drawPointItem(...arguments);
  }
}

/************************* Private helpers *************************/

/** Determine the ITEM_TYPE of a given item */
function itemType(item, accessors) {
  if (accessors.start(item) == accessors.end(item)) return ITEM_TYPES.Point;
  else if (accessors.start(item) < accessors.end(item)) return ITEM_TYPES.Range;
  else return ITEM_TYPES.Invalid;
}

function drawRangeItem(item, accessors, groupEl, scale, opts) {
  let group = d3.select(groupEl);

  // Rect
  group.append('rect')
    .attr({
      x: 0, y: 1,
      width:  (scale(accessors.end(item)) - scale(accessors.start(item))).toFixed(2),
      height: opts.itemHeight - 2
    });

  // Item text
  group.append('text')
    .attr({
      x: ((scale(accessors.end(item)) - scale(accessors.start(item)))/2).toFixed(2),
      y: opts.itemHeight / 2
    })
    .append('tspan')
      .text(accessors.title(item))
      .style({
        'fill': '#000',
        'text-anchor': 'middle',
        'alignment-baseline': 'central'
      });
}

function drawPointItem(item, accessors, groupEl, scale, opts) {
  let group = d3.select(groupEl);

  group.append('circle')
    .attr({
      cx: 0,
      cy: opts.itemHeight / 2,
      r:  opts.itemHeight / 3 - 3
    });

  group.append('text')
    .attr({
      x: opts.itemHeight / 3, // mind the circle
      y: opts.itemHeight / 2
    })
    .append('tspan')
      .text(accessors.title(item))
      .style({
        fill: '#000',
        'text-anchor': 'left',
        'alignment-baseline': 'central'
      });
}
