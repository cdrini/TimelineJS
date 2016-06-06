import { ItemAccessor } from "../TimelineItem.js";
import TimelineSeriesView from "./TimelineSeriesView.js";

/**
 * @global
 * Wrapper class for an array of items that can be drawn in a timeline.
 */
export default class TimelineSeries {
  /**
   * @param  {Object[]} items
   */
  constructor(items) {
    this.items = items;
    this.accessors = new ItemAccessor();
    this._extent = null;
  }

  draw(scale, parent, timelineOpts) {
    return new TimelineSeriesView(this, scale, parent, timelineOpts);
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
