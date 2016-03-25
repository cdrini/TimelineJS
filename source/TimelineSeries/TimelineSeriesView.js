import { drawItem, buildItemContainer } from "../TimelineItem.js";

export default class TimelineSeriesView {
  constructor(series, scale, parent, opts) {
    this.series = series;
    this.scale = scale;
    this.parent = parent;
    this.opts = opts;
    this.stacks = {
      rows: [],
      nextFreeRow: 0
    };

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
  const { opts, scale, stacks } = seriesView;
  const { accessors } = seriesView.series;

  const defaultY = - (stacks.nextFreeRow+1) * opts.itemHeight;
  const bbox = group.getBBox();
  let finalY = defaultY;

  // starting pos of the item
  const itemStart = scale(accessors.start(item));
  const itemPos = {
    start: itemStart + bbox.x,
    end:   itemStart + bbox.x + bbox.width,
    item:  item
  };

  // first item; add directly
  if (stacks.nextFreeRow === 0) {
    finalY = defaultY;
    stacks.rows[stacks.nextFreeRow] = [ itemPos ];
    stacks.nextFreeRow++;
  } else {
    let rowWithRoom = -1;
    let indexInRow = -1;

    // starting from row 0, check if there is room.
    // sorted interval search over each row
    for(let i = 0; i < stacks.nextFreeRow; ++i) {
      const curRow = stacks.rows[i];

      // check left
      if (itemPos.end < curRow[0].start) {
        rowWithRoom = i;
        indexInRow = 0;
        break;
      }
      // check right
      if (itemPos.start > curRow[curRow.length - 1].end) {
        rowWithRoom = i;
        indexInRow = curRow.length;
        break;
      }
      // check middle
      for(let j = 0; j < curRow.length - 1; j++) {
        if (curRow[j].end < itemPos.start && curRow[j+1].start > itemPos.end) {
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
      stacks.rows[rowWithRoom].splice(indexInRow, 0, itemPos);
    } else {
      finalY = defaultY;
      stacks.rows[stacks.nextFreeRow] = [ itemPos ];
      stacks.nextFreeRow++;
    }
  }

  return `translate(${itemStart}, ${finalY})`;
}
