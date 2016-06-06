import { approxEqual, ASC, BOUND, identity, throttle } from "../utils";

const ROW_HEIGHT = 8; // px
const ROW_PADDING = 4; // px

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

    this.drawNowMarker();

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
    this.seriesGroup = this.svg.append('g').classed('tjs-series', true);
    const rangesSeriesPath = this.seriesGroup.append('path').classed('tjs-series-path tjs-ranges', true);
    const pointsSeriesPath = this.seriesGroup.append('path').classed('tjs-series-path tjs-points', true);
    const { seriesViews } = this.timelineView.mainChart;
    this.rowCount = Math.floor(this.opts.miniChartHeight / ROW_HEIGHT);
    this.rowHeight = this.opts.miniChartHeight / this.rowCount;

    const seriesRows = seriesViews[0].rows;
    const rowRatio = seriesRows.length / this.rowCount;
    let rows;
    if (rowRatio < 1) {
      // Each miniRow map to less than one row :/ Increase the rowHeight to fill
      // the view
      this.rowCount = seriesRows.length;
      this.rowHeight = this.opts.miniChartHeight / this.rowCount;
      rows = seriesRows;
    } else if (rowRatio == 1) {
      rows = seriesRows;
    } else if (rowRatio > 1) {
      // we need to merge the rows
      rows = _condenseRows(seriesRows, this.rowCount);
    }

    // draw a line for each event
    this.rangesPathD = "";
    this.pointsPathD = "";
    for(let i = 0; i < rows.length; ++i) this.drawRow(rows[i], i);
    rangesSeriesPath.attr({
      d: this.rangesPathD,
      'stroke-width': (this.rowHeight - ROW_PADDING).toFixed(2)
    });
    pointsSeriesPath.attr({
      d: this.pointsPathD,
      'stroke-width': (this.rowHeight - ROW_PADDING).toFixed(2)
    });
  }

  drawRow(row, i) {
    const yPos = this.opts.miniChartHeight - this.rowHeight * i - this.rowHeight / 2;
    for(let j = 0; j < row.length; ++j) {
      const start = this.xScale(row[j].itemStart);
      const end   = this.xScale(row[j].itemEnd);
      const d = ` M ${start.toFixed(2)},${yPos.toFixed(2)} H ${end.toFixed(2)}`;
      if (start == end) this.pointsPathD += d;
      else this.rangesPathD += d;
    }
  }

  makeViewFieldRect() {
    this.viewFieldRect = this.svg.append('rect').classed('viewfield', true);
  }

  updateViewFieldRect() {
    const mainChart = this.timelineView.mainChart.container.node();
    const miniChartDims = {
      width: this.svg.node().width.baseVal.value,
      height: this.opts.miniChartHeight
    };
    const mainChartDims = mainChart.getBoundingClientRect(); // FIXME use 'cached' values
    const rectWidth = Math.min(this.xScale(mainChartDims.width), miniChartDims.width);
    const rectHeight = Math.min(this.yScale(mainChartDims.height), miniChartDims.height);
    const rectX = BOUND(this.xScale(mainChart.scrollLeft), 0, miniChartDims.width - rectWidth);
    const rectY = BOUND(this.yScale(mainChart.scrollTop), 0, miniChartDims.height - rectHeight);

    this.viewFieldRect.attr({
      x: rectX.toFixed(2),
      y: rectY.toFixed(2),
      width: (rectWidth - 1).toFixed(2),
      height: (rectHeight - 1).toFixed(2)
    });
  }

  updateAxes() {
    this.fitAxisLabels();
  }

  drawNowMarker() {
    const now = Date.now();
    this.markersGroup = this.svg.append('g').classed('tjs-markers', true);
    const pos = this.xScale(this.mainChart.scale(now));
    this.markersGroup.append('line')
      .classed('tjs-marker', true)
      .attr({
        x1: pos.toFixed(2),
        x2: pos.toFixed(2),
        y2: this.opts.miniChartHeight.toFixed(2)
      });
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
    this.throttledScrollHandler = this.throttledScrollHandler || throttle(this.updateViewFieldRect.bind(this), 40);
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
 * @param  {number} n the index to get. Negatives are removed from end. Must be in range!
 * @return {SVGELement|Null} the nth tick text element
 */
function _getNthTickText(axis, n) {
  if(n < 0) n = axis.children.length + n - 1; // -1 for path
  return axis.children[n].children[1];
}

/**
 * Condenses rows of ranges into n rows
 * @param  {Array[]} rows  Array of array of ranges
 * @param  {number} n the length of the new array
 * @return {Array[]} new array with the desired length
 */
function _condenseRows(rows, n) {
  const ratio = rows.length / n;
  const result = [];

  for(let i = 0; !approxEqual(i, rows.length); i += ratio) {
    const newRow = [];

    // get the elements from the next desired rows
    for(let j = Math.floor(i); j < Math.floor(i+ratio); ++j) {
      for(let k = 0; k < rows[j].length; ++k) {
        newRow.push({ itemStart: rows[j][k].itemStart, itemEnd: rows[j][k].itemEnd });
      }
    }

    // merge any consecutive ranges that can be merge (greedy alg!)
    newRow.sort(ASC('itemStart'));
    for(let j = 1; j < newRow.length; ++j) {
      if (newRow[j].itemStart <= newRow[j-1].itemEnd) {
        newRow[j].itemStart = newRow[j-1].itemStart;
        newRow[j].itemEnd = Math.max(newRow[j].itemEnd, newRow[j-1].itemEnd);
        newRow[j-1] = null;
      }
    }

    result.push(newRow.filter(identity));
  }
  return result;
}
