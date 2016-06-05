import { onAnimationFrame, tightwrapViewBox } from "../utils";

const NAMESPACE = 'tjs-axis';

export default class TimelineAxis {
  constructor(timelineView) {
    this.mainChart = timelineView.mainChart;
    this.parent = timelineView.container;

    this.makeContainer();
    this.makeSVG();
    this.makeAxis();

    tightwrapViewBox(this.svg);
    this.mirrorScrolling(NAMESPACE, this.mainChart.container, this.container);

    this.makeRoom();
  }

  makeContainer() {
    this.container = this.parent.append('div').classed(NAMESPACE, true);
  }

  makeSVG() {
    this.svg = this.container.append('svg')
    .attr({
      version: 1.1,
      xmlns: "http://www.w3.org/2000/svg"
    });
  }

  makeAxis() {
    this.axis = d3.svg.axis()
      .scale(this.mainChart.scale)
      .orient("bottom")
      .tickSize(8,4)
      .tickFormat(d => d.getUTCFullYear()) // avoid things like -0800
      .tickPadding(4);

    this.axisGroup = this.svg.append('g')
      .classed('x axis', true)
      .call(this.axis);
  }

  mirrorScrolling() {
    const mainChart = this.mainChart.container;
    const svg = this.svg;
    mainChart.on(`scroll.${NAMESPACE}`, onAnimationFrame(scrollHandler));

    function scrollHandler() {
      const scrollLeft = mainChart.node().scrollLeft;
      svg.style('transform', `translate(-${scrollLeft}px,0px)`);
    }
  }

  makeRoom() {
    const oldPadding = parseFloat(this.parent.style('padding-bottom')) || 0;
    this.container.style('bottom', oldPadding + 'px');
    this.parent.style('padding-bottom', oldPadding + this.svg.node().getBBox().height + 'px');
  }
}
