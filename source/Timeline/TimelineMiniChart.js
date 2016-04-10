import { ASC, identity, throttle } from "../utils";

const ROW_HEIGHT = 5; // px
const ROW_PADDING = 2; // px;

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

    this.drawSeries();
    this.makeAxis();
    this.makeViewFieldRect();


    this.updateAxes();
    this.updateViewFieldRect();

    this.bindScrollEvents();
    this.bindDragEvents();
  }

  makeRoom() {
    this.timelineView.container.style('padding-bottom', `${this.opts.miniChartHeight}px`);
  }

  makeScales() {
    const svgWidth  = parseFloat(this.mainChart.svg.attr('width'), 10);
    const svgHeight = parseFloat(this.mainChart.svg.attr('height'), 10);
    const { width:containerWidth } = this.parent.node().getBoundingClientRect();

    this.timeScale = this.mainChart.scale.copy().range([0, containerWidth]);
    this.xScale = d3.scale.linear().domain([0, svgWidth]).range([0, containerWidth]);
    this.yScale = d3.scale.linear().domain([0, svgHeight]).range([0, this.opts.miniChartHeight]);
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
      .scale(this.timeScale)
      .tickSize(0,0)
      .tickFormat(d => d.getUTCFullYear()) // avoid things like -0800
      .tickPadding(0);

    this.axisGroup = this.svg.append('g')
      .classed('time axis', true)
      .attr('transform', `translate(0, ${this.opts.miniChartHeight/2})`)
      .call(this.axis);
  }

  drawSeries() {
    this.seriesPath = this.svg.append('path').classed('tjs-items', true);
    const { seriesViews } = this.timelineView.mainChart;
    this.rowCount = Math.floor(this.opts.miniChartHeight / ROW_HEIGHT);
    this.rowHeight = this.opts.miniChartHeight / this.rowCount;

    const seriesRows = seriesViews[0].stacks.rows;
    const rowRatio = seriesRows.length / this.rowCount;
    if (rowRatio < 1) {
      // Each miniRow map to less than one row :/ Increase the rowHeight to fill
      // the view
      this.rowCount = seriesRows.length;
      this.rowHeight = this.opts.miniChartHeight / this.rowCount;
      this.rows = seriesRows;
    } else if (rowRatio == 1) {
      this.rows = seriesRows;
    } else if (rowRatio > 1) {
      // we need to merge the rows
      this.rows = _condenseRows(seriesRows, this.rowCount);
    }

    // draw a line for each event
    let pathD = '';
    for(let i = 0; i < this.rows.length; ++i) pathD += this.drawRow(i);
    this.seriesPath.attr({
      d: pathD,
      'stroke-width': (this.rowHeight - ROW_PADDING).toFixed(2)
    });
  }

  drawRow(i) {
    const row = this.rows[i];
    const yPos = this.opts.miniChartHeight - this.rowHeight * i - this.rowHeight / 2;
    let path = "";
    for(let j = 0; j < row.length; ++j) {
      const start = this.xScale(row[j].start),
            end = this.xScale(row[j].end);
      path += ` M ${start.toFixed(2)},${yPos.toFixed(2)} H ${end.toFixed(2)}`;
    }
    return path;
  }

  makeViewFieldRect() {
    this.viewFieldRect = this.svg.append('rect').classed('viewfield', true);
  }

  updateViewFieldRect() {
    const mainChart = this.timelineView.mainChart.container.node();
    let {width, height} = mainChart.getBoundingClientRect(); // FIXME use 'cached' values
    width = Math.min(width, this.timelineView.mainChart.svg.node().width.baseVal.value);
    // FIXME: This is wrong, since it includes the size of the xaxis

    this.viewFieldRect.attr({
      x: this.xScale(mainChart.scrollLeft),
      y: this.yScale(mainChart.scrollTop),
      width: this.xScale(width).toFixed(2) - 1,
      height: Math.min(this.yScale(height), this.opts.miniChartHeight).toFixed(2) - 1
    });
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

  bindScrollEvents() {
    this.throttledScrollHandler = this.throttledScrollHandler || throttle(this.updateViewFieldRect.bind(this), 50);
    this.timelineView.mainChart.container.on('scroll', this.throttledScrollHandler);
  }

  unbindScrollEvents() {
    this.timelineView.mainChart.container.on('scroll', null);
  }

  bindDragEvents() {
    const { svg, viewFieldRect } = this;
    const { miniChartHeight } = this.opts;
    const miniChartWidth = svg.node().width.baseVal.value;
    const mainChartContainer = this.timelineView.mainChart.container;
    const { xScale, yScale } = this;
    const miniChart = this;
    let mouseToBoxRatio = { x: 0.5, y: 0.5 }; // where the mouse is in the box

    svg.on('mousedown', startDrag);
    svg.on('touchstart', startDrag);

    function startDrag() {
      miniChart.unbindScrollEvents();
      if (d3.event.target == viewFieldRect.node()) {
        const mouse = d3.mouse(viewFieldRect.node());
        mouseToBoxRatio.x = (mouse[0] - viewFieldRect.attr('x')) / viewFieldRect.attr('width');
        mouseToBoxRatio.y = (mouse[1] - viewFieldRect.attr('y')) / viewFieldRect.attr('height');
      } else {
        mouseToBoxRatio = { x: 0.5, y: 0.5 };
      }

      dragMain();
      d3.select(document).on('mousemove.tjs', dragMain);
      d3.select(document).on('touchmove.tjs', dragMain);

      d3.select(document).on('mouseup.tjs',    endDrag);
      d3.select(document).on('touchend.tjs',   endDrag);
    }

    function dragMain() {
      const mousePos = d3.mouse(svg.node());

      const boxPos = {
        x: mousePos[0] - mouseToBoxRatio.x * viewFieldRect.attr('width'),
        y: mousePos[1] - mouseToBoxRatio.y * viewFieldRect.attr('height')
      };
      boxPos.x = Math.min(boxPos.x, miniChartWidth - viewFieldRect.attr('width') - 2);
      boxPos.y = Math.min(boxPos.y, miniChartHeight - viewFieldRect.attr('height') - 2);
      boxPos.x = Math.max(0, boxPos.x);
      boxPos.y = Math.max(0, boxPos.y);

      viewFieldRect.attr({
        x: boxPos.x.toFixed(2),
        y: boxPos.y.toFixed(2)
      });

      mainChartContainer.node().scrollTop = yScale.invert(boxPos.y);
      mainChartContainer.node().scrollLeft = xScale.invert(boxPos.x);
    }

    function endDrag() {
      miniChart.bindScrollEvents();
      d3.select(document).on('mousemove.tjs', null);
      d3.select(document).on('touchmove.tjs', null);
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

/**
 * Condenses rows of ranges into n rows
 * @param  {Array[]} rows  Array of array of ranges
 * @param  {Number} n the length of the new array
 * @return {Array[]} new array with the desired length
 */
function _condenseRows(rows, n) {
  const ratio = rows.length / n;
  const result = [];

  for(let i = 0; i < rows.length; i += ratio) {
    const newRow = [];

    // get the elements from the next desired rows
    for(let j = Math.floor(i); j < Math.floor(i+ratio); ++j) {
      for(let k = 0; k < rows[j].length; ++k) {
        newRow.push({ start: rows[j][k].start, end: rows[j][k].end });
      }
    }

    // merge any consecutive ranges that can be merge (greedy alg!)
    newRow.sort(ASC('start'));
    for(let j = 1; j < newRow.length; ++j) {
      if (newRow[j].start <= newRow[j-1].end) {
        newRow[j].start = newRow[j-1].start;
        newRow[j].end = Math.max(newRow[j].end, newRow[j-1].end);
        newRow[j-1] = null;
      }
    }

    result.push(newRow.filter(identity));
  }
  return result;
}
