import TimelineView from "./TimelineView/TimelineView.js";
import TimelineSeries from "./TimelineSeries/TimelineSeries.js";

/**************** STATIC VARIABLES ****************/

const DEFAULT_OPTS = {
      widthOfYear: 20, //px
       itemHeight: 20, //px
      itemPadding:  2, //px
          padding: 20, //px
    axisLabelSize: 20, //px
  miniChartHeight: 80  //px
};

/**
 * @global
 * @param {*[]|TimelineSeries[]|TimelineSeries} itemsOrSeries
 *        A series, an Array of series, or an array of plain items
 * @param {Object} [opts] config object
 *   @param {number} [opts.widthOfYear] width (px) of a year
 *   @param {number} [opts.itemHeight] height (px) of each row
 *   @param {number} [opts.itemPadding] @todo
 *   @param {number} [opts.padding] padding of the viz from the left/right
 *   @param {number} [opts.axisLabelSize] @todo
 */
export default class Timeline {
  constructor(itemsOrSeries, opts={}) {
    if (itemsOrSeries instanceof TimelineSeries) this.series = [ itemsOrSeries ];
    else if (itemsOrSeries instanceof Array) {
      if (itemsOrSeries[0] instanceof TimelineSeries) this.series = itemsOrSeries;
      else this.series = [ new TimelineSeries(itemsOrSeries) ];
    }

    this.opts = Object.assign({}, DEFAULT_OPTS, opts);
  }

  drawIn(parent) {
    this.parent = parent;
    this.view = new TimelineView(this);
  }
}
window.Timeline = window.Timeline || Timeline;
