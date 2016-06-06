import TimelineMainChart from "./TimelineMainChart.js";
import TimelineMiniChart from "./TimelineMiniChart.js";
import TimelineAxis from "./TimelineAxis.js";

export default class TimelineView {
  constructor(timeline) {
    this.model = timeline;
    const { parent } = timeline;

    this.container = d3.select(parent).append('div')
      .classed('tjs-container', true);

    this.mainChart = new TimelineMainChart(this);
    this.miniChart = new TimelineMiniChart(this);
    this.axis = new TimelineAxis(this);

    this.mainChart.scrollToBottom();
  }
}
