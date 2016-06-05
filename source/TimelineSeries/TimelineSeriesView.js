import { drawItem, buildItemContainer } from "../TimelineItem.js";

export default class TimelineSeriesView {
  constructor(series, scale, parent, opts) {
    this.series = series;
    this.scale = scale;
    this.parent = parent;
    this.opts = opts;
    this.rows = [];
    this.rows.nextFreeRow = 0;

    this.draw();
  }

  draw() {
    const _this = this;
    const { accessors } = this.series;

    let items = d3.select(this.parent)
      .classed('tjs-series', true)
      .selectAll('tjs-item')
      .data(this.series.items)
      .enter()
      .append(d => buildItemContainer(d, accessors))
        .classed('tjs-item', true);

    // TODO: Switch to using call, if possible
    items.each(function(d, i) {
      drawItem(d, accessors, this, _this.scale, _this.opts);
      d3.select(this).attr('transform', _itemTransform(_this, d, this));
    });
  }
}

/************************* Private helpers *************************/

function _itemTransform(seriesView, item, group) {
  const { opts, scale, rows } = seriesView;
  const { accessors } = seriesView.series;

  const defaultY = - (rows.nextFreeRow+1) * opts.itemHeight;
  const bbox = group.getBBox();
  let finalY = defaultY;

  // starting pos of the item
  const itemStart = scale(accessors.start(item));
  const itemEnd = scale(accessors.end(item));
  const itemPos = {
    itemStart: itemStart,
    itemEnd:   itemEnd,
    bboxStart: itemStart + bbox.x,
    bboxEnd:   itemStart + bbox.x + bbox.width,
    item: item
  };

  // first item; add directly
  if (rows.nextFreeRow === 0) {
    finalY = defaultY;
    rows[rows.nextFreeRow] = [ itemPos ];
    rows.nextFreeRow++;
  } else {
    let rowWithRoom = -1;
    let indexInRow = -1;

    // starting from row 0, check if there is room.
    // sorted interval search over each row
    for(let i = 0; i < rows.nextFreeRow; ++i) {
      const curRow = rows[i];

      // check left
      if (itemPos.bboxEnd < curRow[0].bboxStart) {
        rowWithRoom = i;
        indexInRow = 0;
        break;
      }
      // check right
      if (itemPos.bboxStart > curRow[curRow.length - 1].bboxEnd) {
        rowWithRoom = i;
        indexInRow = curRow.length;
        break;
      }
      // check middle
      for(let j = 0; j < curRow.length - 1; j++) {
        if (curRow[j].bboxEnd < itemPos.bboxStart && curRow[j+1].bboxStart > itemPos.bboxEnd) {
          rowWithRoom = i;
          indexInRow = j+1;
          break;
        }
      }

      if (rowWithRoom != -1) break;
    }

    if (rowWithRoom != -1) {
      // success! put it here
      finalY = - (rowWithRoom+1) * opts.itemHeight;

      // insert in row, maintaining sort
      rows[rowWithRoom].splice(indexInRow, 0, itemPos);
    } else {
      finalY = defaultY;
      rows[rows.nextFreeRow] = [ itemPos ];
      rows.nextFreeRow++;
    }
  }

  return `translate(${itemStart.toFixed(2)}, ${finalY})`;
}
