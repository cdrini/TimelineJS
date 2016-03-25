import {extentBBox, time} from "../utils";

export default class TimelineMainChart {
  constructor(timelineView) {
    this.timeline = timelineView.model;
    this.opts = this.timeline.opts;
    this.parent = timelineView.container;
    this.series = this.timeline.series;

    this.makeScale();

    this.makeContainer();
    this.makeSVG();
    this.makeAxis();
    this.makeGrid();

    this.drawSeries();
    this.updateAxes();
    this.tightwrapViewBox();
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

  makeAxis() {
    this.axis = d3.svg.axis()
      .scale(this.scale)
      // .ticks(50)
      .orient("bottom")
      .tickSize(8,4)
      .tickFormat(d => d.getUTCFullYear()) // avoid things like -0800
      .tickPadding(4);

    this.axisGroup = this.svg.append('g')
      .classed('x axis', true)
      .call(this.axis);
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
    this.timeline.series[0].draw(this.scale, this.seriesGroup.node(), this.opts);
  }

  updateAxes() {
    const { scale, svg } = this;
    const pad = this.opts.padding;

    const bbox = this.seriesGroup.node().getBBox();
    const newDomain = [scale.invert(bbox.x - pad), scale.invert(bbox.x + bbox.width + pad)];
    const newRange = [ bbox.x - pad, bbox.x + bbox.width + pad];
    scale.domain(newDomain).range(newRange);

    this.gridAxis.tickSize(-1*bbox.height, 0);
    this.gridGroup.call(this.gridAxis);
    this.axisGroup.call(this.axis);
  }

  tightwrapViewBox() {
    const bbox = extentBBox(this.svg.node().children);
    this.svg.attr({
      viewBox: `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`,
      width: bbox.width,
      height: bbox.height
    });
  }
}
