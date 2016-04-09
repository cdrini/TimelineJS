import {extentBBox, time} from "../utils";

export default class TimelineMiniChart {
  constructor(timelineView) {
    this.timelineView = timelineView;
    this.timeline = timelineView.model;
    this.opts = this.timeline.opts;
    this.series = this.timeline.series;
    this.parent = timelineView.container;
    this.mainChart = timelineView.mainChart;

    this.makeRoom();

    this.makeScales();

    this.makeContainer();
    this.makeSVG();
    this.makeAxis();

    this.drawSeries();

    this.updateAxes();

    // this.bindScrollEvents();
  }

  makeRoom() {
    this.timelineView.container.style('padding-bottom', `${this.opts.miniChartHeight}px`);
  }

  makeScales() {
    const svgWidth  = parseFloat(this.mainChart.svg.attr('width'), 10);
    const svgHeight = parseFloat(this.mainChart.svg.attr('height'), 10);
    const { width:containerWidth } = this.parent.node().getBoundingClientRect();

    this.timescale = this.mainChart.scale.copy().range([0, containerWidth]);
    this.xscale = d3.scale.linear().domain([0, svgWidth]).range([0, containerWidth]);
    this.yscale = d3.scale.linear().domain([0, svgHeight]).range([0, this.opts.miniChartHeight]);
  }

  makeContainer() {
    this.container = this.parent.append('div').classed('tjs-mini', true)
    .style({
      width: '100%',
      height: this.opts.miniChartHeight
    });
  }

  makeSVG() {
    this.svg = this.container.append('svg')
      .attr({
        version: 1.1,
        xmlns: "http://www.w3.org/2000/svg",
        width: '100%',
        height: this.opts.miniChartHeight
      });
  }

  makeAxis() {
    this.axis = d3.svg.axis()
      .scale(this.timescale)
      .tickSize(0,0)
      .tickFormat(d => d.getUTCFullYear()) // avoid things like -0800
      .tickPadding(0);

    this.axisGroup = this.svg.append('g')
      .classed('time axis', true)
      .call(this.axis);
  }

  drawSeries() {
    this.seriesPath = this.svg.append('path');

    // draw a line for each event
  }

  updateAxes() {
    this.fitAxisLabels();
  }

  fitAxisLabels() {
    // Ensure far left/far right fit on screen
    const bbox = this.axisGroup.node().getBBox();

    if (bbox.x < 0) {
      // left needs to be pushed in
      _getNthTickText(this.axisGroup.node(), 0).style['text-anchor'] = "start";
    }
    if (bbox.width > this.svg.node().width.baseVal.value) {
      // right needs to be pushed in
      _getNthTickText(this.axisGroup.node(), -1).style['text-anchor'] = "end";
    }
  }
}

/**
 * Get the text element of the nth tick
 * @param  {SVGElement} el the axis element containing the ticks
 * @param  {Number} n the index to get. Negatives are removed from end. Must be in range!
 * @return {SVGELement|Null} the nth tick text element
 */
function _getNthTickText(axis, n) {
  if(n < 0) n = axis.children.length + n - 1; // -1 for path
  return axis.children[n].children[1];
}
