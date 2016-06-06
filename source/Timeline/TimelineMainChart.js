import { tightwrapViewBox, time } from "../utils";

export default class TimelineMainChart {
  constructor(timelineView) {
    this.timeline = timelineView.model;
    this.opts = this.timeline.opts;
    this.parent = timelineView.container;
    this.series = this.timeline.series;
    this.seriesViews = [];

    this.makeScale();

    this.makeContainer();
    this.makeSVG();
    this.makeGrid();

    this.drawSeries();
    this.updateGrid();
    tightwrapViewBox(this.svg);

    this.scrollToBottom();
    this.drawNowMarker();
  }

  makeScale() {
    const [timeMin, timeMax] = this.series[0].extent();

    this.scale = d3.time.scale()
      .domain([timeMin, timeMin + time.oneYear])
      .range([0, this.opts.widthOfYear]);
  }

  makeContainer() {
    this.container = this.parent.append('div').classed('tjs-main', true);
  }

  makeSVG() {
    this.svg = this.container.append('svg')
      .attr("version", 1.1)
      .attr("xmlns", "http://www.w3.org/2000/svg");
  }

  makeGrid() {
    this.gridAxis = d3.svg.axis()
      .scale(this.scale)
      .ticks(100)
      .tickFormat('')
      .orient("bottom")
      .tickSize(0, 0);

    this.gridGroup = this.svg.append('g')
      .classed('tjs-grid', true)
      .call(this.gridAxis);
  }

  drawSeries() {
    this.seriesGroup = this.svg.append('g');
    this.seriesViews[0] = this.timeline.series[0].draw(this.scale, this.seriesGroup.node(), this.opts);
  }

  updateGrid() {
    const { scale, svg } = this;
    const pad = this.opts.padding;

    const bbox = this.seriesGroup.node().getBBox();
    this.bbox = bbox;
    const newDomain = [scale.invert(bbox.x - pad), scale.invert(bbox.x + bbox.width + pad)];
    const newRange = [bbox.x - pad, bbox.x + bbox.width + pad];
    scale.domain(newDomain).range(newRange);

    this.gridAxis.tickSize(-1*bbox.height, 0);
    this.gridGroup.call(this.gridAxis);
  }

  scrollToBottom() {
    this.container.node().scrollLeft = this.bbox.width;
    this.container.node().scrollTop = this.bbox.height;
  }

  drawNowMarker() {
    const now = Date.now();
    this.markersGroup = this.svg.append('g').classed('tjs-markers', true);
    const pos = this.scale(now);
    this.markersGroup.append('line')
      .classed('tjs-marker', true)
      .attr({
        x1: pos.toFixed(2),
        x2: pos.toFixed(2),
        y2: (-this.bbox.height).toFixed(2)
      });
  }
}
