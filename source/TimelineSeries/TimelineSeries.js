import { ItemAccessor } from "../TimelineItem.js";
import TimelineSeriesView from "./TimelineSeriesView.js";

export default class TimelineSeries {
  /**
   * @param  {Object[]} items
   * @param  {Object}   [opts]
   */
  constructor(items, opts={}) {
    this.items = items;
    this.accessors = new ItemAccessor();
    this.opts = Object.assign({}, opts);

    this._extent = null;
  }

  draw(scale, parent, opts) {
    return new TimelineSeriesView(this, scale, parent, opts);
  }

  // stats
  min() { return (this._extent || this.updateStats())[0]; }
  max() { return (this._extent || this.updateStats())[1]; }
  extent() { return [this.min(), this.max()]; }

  updateStats() {
    const { items, accessors } = this;

    this._extent = [ d3.min(items, accessors.start), d3.max(items, accessors.end) ];
    return this._extent;
  }
}
window.TimelineSeries = window.TimelineSeries || TimelineSeries;
