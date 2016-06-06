(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _TimelineView = require("./TimelineView/TimelineView.js");

var _TimelineView2 = _interopRequireDefault(_TimelineView);

var _TimelineSeries = require("./TimelineSeries/TimelineSeries.js");

var _TimelineSeries2 = _interopRequireDefault(_TimelineSeries);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**************** STATIC VARIABLES ****************/

var DEFAULT_OPTS = {
  widthOfYear: 20, //px
  itemHeight: 20, //px
  itemPadding: 2, //px
  padding: 20, //px
  axisLabelSize: 20, //px
  miniChartHeight: 80 //px
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

var Timeline = function () {
  function Timeline(itemsOrSeries) {
    var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, Timeline);

    if (itemsOrSeries instanceof _TimelineSeries2.default) this.series = [itemsOrSeries];else if (itemsOrSeries instanceof Array) {
      if (itemsOrSeries[0] instanceof _TimelineSeries2.default) this.series = itemsOrSeries;else this.series = [new _TimelineSeries2.default(itemsOrSeries)];
    }

    this.opts = Object.assign({}, DEFAULT_OPTS, opts);
  }

  _createClass(Timeline, [{
    key: "drawIn",
    value: function drawIn(parent) {
      this.parent = parent;
      this.view = new _TimelineView2.default(this);
    }
  }]);

  return Timeline;
}();

exports.default = Timeline;

window.Timeline = window.Timeline || Timeline;

},{"./TimelineSeries/TimelineSeries.js":3,"./TimelineView/TimelineView.js":8}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ItemAccessor = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.buildItemContainer = buildItemContainer;
exports.drawItem = drawItem;

var _utils = require("./utils");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/************************* Constants *************************/
var XMLNS = "http://www.w3.org/2000/svg";
var ITEM_TYPES = {
  Invalid: -1,
  Range: 1,
  Point: 2
};
var ACCESSORS = {
  start: function start(item) {
    return (0, _utils.dateToTimestamp)(item.start);
  },
  end: function end(item) {
    return (0, _utils.dateToTimestamp)(item.end, Date.now());
  },
  title: function title(item) {
    return item.title;
  },
  link: function link(item) {
    return item.link;
  }
};

/************************* Public Classes *************************/

var ItemAccessor = exports.ItemAccessor = function () {
  function ItemAccessor() {
    _classCallCheck(this, ItemAccessor);

    Object.assign(this, ACCESSORS);
  }

  _createClass(ItemAccessor, [{
    key: "define",
    value: function define(newAccessors) {
      for (var k in newAccessors) {
        if (!ACCESSORS[k]) throw "Unrecognized item accessor '" + k + "'";else this[k] = newAccessors[k];
      }
    }
  }]);

  return ItemAccessor;
}();

/************************* Public Rendering *************************/
/**
 * Build a timeline item's container
 * @param  {Object}       d         timeline item
 * @param  {ItemAccessor} accessors
 * @return {SVGElement}
 */


function buildItemContainer(d, accessors) {
  if (accessors.link(d)) {
    return d3.select(document.createElementNS(XMLNS, 'a')).attr({
      'xlink:href': accessors.link(d),
      'xlink:show': 'new'
    }).node();
  } else {
    return document.createElementNS(XMLNS, 'g');
  }
}

/**
 * Draw a timeline item in the specified parent element
 * @param  {Object}        item      timeline item
 * @param  {ItemAccessor}  accessors
 * @param  {SVGElement}    group
 * @param  {Object}        opts
 */
function drawItem(item, accessors, group, scale, opts) {
  var type = itemType(item, accessors);
  switch (type) {
    case ITEM_TYPES.Range:
      return drawRangeItem.apply(undefined, arguments);
    case ITEM_TYPES.Point:
      return drawPointItem.apply(undefined, arguments);
  }
}

/************************* Private helpers *************************/

/** Determine the ITEM_TYPE of a given item */
function itemType(item, accessors) {
  if (accessors.start(item) == accessors.end(item)) return ITEM_TYPES.Point;else if (accessors.start(item) < accessors.end(item)) return ITEM_TYPES.Range;else return ITEM_TYPES.Invalid;
}

function drawRangeItem(item, accessors, groupEl, scale, opts) {
  var group = d3.select(groupEl);

  // Rect
  group.append('rect').attr({
    x: 0, y: 1,
    width: (scale(accessors.end(item)) - scale(accessors.start(item))).toFixed(2),
    height: opts.itemHeight - 2
  });

  // Item text
  group.append('text').attr({
    x: ((scale(accessors.end(item)) - scale(accessors.start(item))) / 2).toFixed(2),
    y: opts.itemHeight / 2
  }).append('tspan').text(accessors.title(item)).style({
    'fill': '#000',
    'text-anchor': 'middle',
    'alignment-baseline': 'central'
  });
}

function drawPointItem(item, accessors, groupEl, scale, opts) {
  var group = d3.select(groupEl);

  group.append('circle').attr({
    cx: 0,
    cy: opts.itemHeight / 2,
    r: opts.itemHeight / 3 - 3
  });

  group.append('text').attr({
    x: opts.itemHeight / 3, // mind the circle
    y: opts.itemHeight / 2
  }).append('tspan').text(accessors.title(item)).style({
    fill: '#000',
    'text-anchor': 'left',
    'alignment-baseline': 'central'
  });
}

},{"./utils":9}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _TimelineItem = require("../TimelineItem.js");

var _TimelineSeriesView = require("./TimelineSeriesView.js");

var _TimelineSeriesView2 = _interopRequireDefault(_TimelineSeriesView);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @global
 * Wrapper class for an array of items that can be drawn in a timeline.
 */

var TimelineSeries = function () {
  /**
   * @param  {Object[]} items
   */

  function TimelineSeries(items) {
    _classCallCheck(this, TimelineSeries);

    this.items = items;
    this.accessors = new _TimelineItem.ItemAccessor();
    this._extent = null;
  }

  _createClass(TimelineSeries, [{
    key: "draw",
    value: function draw(scale, parent, timelineOpts) {
      return new _TimelineSeriesView2.default(this, scale, parent, timelineOpts);
    }

    // stats

  }, {
    key: "min",
    value: function min() {
      return (this._extent || this.updateStats())[0];
    }
  }, {
    key: "max",
    value: function max() {
      return (this._extent || this.updateStats())[1];
    }
  }, {
    key: "extent",
    value: function extent() {
      return [this.min(), this.max()];
    }
  }, {
    key: "updateStats",
    value: function updateStats() {
      var items = this.items;
      var accessors = this.accessors;


      this._extent = [d3.min(items, accessors.start), d3.max(items, accessors.end)];
      return this._extent;
    }
  }]);

  return TimelineSeries;
}();

exports.default = TimelineSeries;

window.TimelineSeries = window.TimelineSeries || TimelineSeries;

},{"../TimelineItem.js":2,"./TimelineSeriesView.js":4}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _TimelineItem = require('../TimelineItem.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TimelineSeriesView = function () {
  function TimelineSeriesView(series, scale, parent, opts) {
    _classCallCheck(this, TimelineSeriesView);

    this.series = series;
    this.scale = scale;
    this.parent = parent;
    this.opts = opts;
    this.rows = [];
    this.rows.nextFreeRow = 0;

    this.draw();
  }

  _createClass(TimelineSeriesView, [{
    key: 'draw',
    value: function draw() {
      var _this = this;
      var accessors = this.series.accessors;


      var items = d3.select(this.parent).classed('tjs-series', true).selectAll('tjs-item').data(this.series.items).enter().append(function (d) {
        return (0, _TimelineItem.buildItemContainer)(d, accessors);
      }).classed('tjs-item', true);

      // TODO: Switch to using call, if possible
      items.each(function (d, i) {
        (0, _TimelineItem.drawItem)(d, accessors, this, _this.scale, _this.opts);
        d3.select(this).attr('transform', _itemTransform(_this, d, this));
      });
    }
  }]);

  return TimelineSeriesView;
}();

/************************* Private helpers *************************/

exports.default = TimelineSeriesView;
function _itemTransform(seriesView, item, group) {
  var opts = seriesView.opts;
  var scale = seriesView.scale;
  var rows = seriesView.rows;
  var accessors = seriesView.series.accessors;


  var defaultY = -(rows.nextFreeRow + 1) * opts.itemHeight;
  // FIXME: performance bottle neck; forces a LOT of recalcs
  var bbox = group.getBBox();
  var finalY = defaultY;

  // starting pos of the item
  var itemStart = scale(accessors.start(item));
  var itemEnd = scale(accessors.end(item));
  var itemPos = {
    itemStart: itemStart,
    itemEnd: itemEnd,
    bboxStart: itemStart + bbox.x,
    bboxEnd: itemStart + bbox.x + bbox.width,
    item: item
  };

  // first item; add directly
  if (rows.nextFreeRow === 0) {
    finalY = defaultY;
    rows[rows.nextFreeRow] = [itemPos];
    rows.nextFreeRow++;
  } else {
    var rowWithRoom = -1;
    var indexInRow = -1;

    // starting from row 0, check if there is room.
    // sorted interval search over each row
    for (var i = 0; i < rows.nextFreeRow; ++i) {
      var curRow = rows[i];

      // check left
      if (itemPos.bboxEnd < curRow[0].bboxStart) {
        rowWithRoom = i;
        indexInRow = 0;
        break;
      }
      // check right
      if (itemPos.bboxStart > curRow[curRow.length - 1].bboxEnd) {
        rowWithRoom = i;
        indexInRow = curRow.length;
        break;
      }
      // check middle
      for (var j = 0; j < curRow.length - 1; j++) {
        if (curRow[j].bboxEnd < itemPos.bboxStart && curRow[j + 1].bboxStart > itemPos.bboxEnd) {
          rowWithRoom = i;
          indexInRow = j + 1;
          break;
        }
      }

      if (rowWithRoom != -1) break;
    }

    if (rowWithRoom != -1) {
      // success! put it here
      finalY = -(rowWithRoom + 1) * opts.itemHeight;

      // insert in row, maintaining sort
      rows[rowWithRoom].splice(indexInRow, 0, itemPos);
    } else {
      finalY = defaultY;
      rows[rows.nextFreeRow] = [itemPos];
      rows.nextFreeRow++;
    }
  }

  return 'translate(' + itemStart.toFixed(2) + ', ' + finalY + ')';
}

},{"../TimelineItem.js":2}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('../utils');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NAMESPACE = 'tjs-axis';

var TimelineAxis = function () {
  function TimelineAxis(timelineView) {
    _classCallCheck(this, TimelineAxis);

    this.mainChart = timelineView.mainChart;
    this.parent = timelineView.container;

    this.makeContainer();
    this.makeSVG();
    this.makeAxis();

    (0, _utils.tightwrapViewBox)(this.svg);
    this.mirrorScrolling(NAMESPACE, this.mainChart.container, this.container);

    this.makeRoom();
  }

  _createClass(TimelineAxis, [{
    key: 'makeContainer',
    value: function makeContainer() {
      this.container = this.parent.append('div').classed(NAMESPACE, true);
    }
  }, {
    key: 'makeSVG',
    value: function makeSVG() {
      this.svg = this.container.append('svg').attr({
        version: 1.1,
        xmlns: "http://www.w3.org/2000/svg"
      });
    }
  }, {
    key: 'makeAxis',
    value: function makeAxis() {
      this.axis = d3.svg.axis().scale(this.mainChart.scale).orient("bottom").tickSize(8, 4).tickFormat(function (d) {
        return d.getUTCFullYear();
      }) // avoid things like -0800
      .tickPadding(4);

      this.axisGroup = this.svg.append('g').classed('x axis', true).call(this.axis);
    }
  }, {
    key: 'mirrorScrolling',
    value: function mirrorScrolling() {
      var mainChart = this.mainChart.container;
      var svg = this.svg;
      mainChart.on('scroll.' + NAMESPACE, (0, _utils.onAnimationFrame)(scrollHandler));

      function scrollHandler() {
        var scrollLeft = mainChart.node().scrollLeft;
        svg.style('transform', 'translate(-' + scrollLeft + 'px,0px)');
      }
    }
  }, {
    key: 'makeRoom',
    value: function makeRoom() {
      var oldPadding = parseFloat(this.parent.style('padding-bottom')) || 0;
      this.container.style('bottom', oldPadding + 'px');
      this.parent.style('padding-bottom', oldPadding + this.svg.node().getBBox().height + 'px');
    }
  }]);

  return TimelineAxis;
}();

exports.default = TimelineAxis;

},{"../utils":9}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('../utils');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TimelineMainChart = function () {
  function TimelineMainChart(timelineView) {
    _classCallCheck(this, TimelineMainChart);

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
    (0, _utils.tightwrapViewBox)(this.svg);

    this.scrollToBottom();
    this.drawNowMarker();
  }

  _createClass(TimelineMainChart, [{
    key: 'makeScale',
    value: function makeScale() {
      var _series$0$extent = this.series[0].extent();

      var _series$0$extent2 = _slicedToArray(_series$0$extent, 2);

      var timeMin = _series$0$extent2[0];
      var timeMax = _series$0$extent2[1];


      this.scale = d3.time.scale().domain([timeMin, timeMin + _utils.time.oneYear]).range([0, this.opts.widthOfYear]);
    }
  }, {
    key: 'makeContainer',
    value: function makeContainer() {
      this.container = this.parent.append('div').classed('tjs-main', true);
    }
  }, {
    key: 'makeSVG',
    value: function makeSVG() {
      this.svg = this.container.append('svg').attr("version", 1.1).attr("xmlns", "http://www.w3.org/2000/svg");
    }
  }, {
    key: 'makeGrid',
    value: function makeGrid() {
      this.gridAxis = d3.svg.axis().scale(this.scale).ticks(100).tickFormat('').orient("bottom").tickSize(0, 0);

      this.gridGroup = this.svg.append('g').classed('tjs-grid', true).call(this.gridAxis);
    }
  }, {
    key: 'drawSeries',
    value: function drawSeries() {
      this.seriesGroup = this.svg.append('g');
      this.seriesViews[0] = this.timeline.series[0].draw(this.scale, this.seriesGroup.node(), this.opts);
    }
  }, {
    key: 'updateGrid',
    value: function updateGrid() {
      var scale = this.scale;
      var svg = this.svg;

      var pad = this.opts.padding;

      var bbox = this.seriesGroup.node().getBBox();
      this.bbox = bbox;
      var newDomain = [scale.invert(bbox.x - pad), scale.invert(bbox.x + bbox.width + pad)];
      var newRange = [bbox.x - pad, bbox.x + bbox.width + pad];
      scale.domain(newDomain).range(newRange);

      this.gridAxis.tickSize(-1 * bbox.height, 0);
      this.gridGroup.call(this.gridAxis);
    }
  }, {
    key: 'scrollToBottom',
    value: function scrollToBottom() {
      this.container.node().scrollLeft = this.bbox.width;
      this.container.node().scrollTop = this.bbox.height;
    }
  }, {
    key: 'drawNowMarker',
    value: function drawNowMarker() {
      var now = Date.now();
      this.markersGroup = this.svg.append('g').classed('tjs-markers', true);
      var pos = this.scale(now);
      this.markersGroup.append('line').classed('tjs-marker', true).attr({
        x1: pos.toFixed(2),
        x2: pos.toFixed(2),
        y2: (-this.bbox.height).toFixed(2)
      });
    }
  }]);

  return TimelineMainChart;
}();

exports.default = TimelineMainChart;

},{"../utils":9}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('../utils');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ROW_HEIGHT = 8; // px
var ROW_PADDING = 4; // px

var TimelineMiniChart = function () {
  function TimelineMiniChart(timelineView) {
    _classCallCheck(this, TimelineMiniChart);

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

  _createClass(TimelineMiniChart, [{
    key: 'makeRoom',
    value: function makeRoom() {
      this.timelineView.container.style('padding-bottom', this.opts.miniChartHeight + 'px');
    }
  }, {
    key: 'makeScales',
    value: function makeScales() {
      var svgWidth = parseFloat(this.mainChart.svg.attr('width'), 10);
      var svgHeight = parseFloat(this.mainChart.svg.attr('height'), 10);

      var _parent$node$getBound = this.parent.node().getBoundingClientRect();

      var containerWidth = _parent$node$getBound.width;


      this.timeScale = this.mainChart.scale.copy().range([0, containerWidth]);
      this.xScale = d3.scale.linear().domain([0, svgWidth]).range([0, containerWidth]);
      this.yScale = d3.scale.linear().domain([0, svgHeight]).range([0, this.opts.miniChartHeight]);
    }
  }, {
    key: 'makeContainer',
    value: function makeContainer() {
      this.container = this.parent.append('div').classed('tjs-mini', true).style({
        width: '100%',
        height: this.opts.miniChartHeight
      });
    }
  }, {
    key: 'makeSVG',
    value: function makeSVG() {
      this.svg = this.container.append('svg').attr({
        version: 1.1,
        xmlns: "http://www.w3.org/2000/svg",
        width: '100%',
        height: this.opts.miniChartHeight
      });
    }
  }, {
    key: 'makeAxis',
    value: function makeAxis() {
      this.axis = d3.svg.axis().scale(this.timeScale).tickSize(0, 0).tickFormat(function (d) {
        return d.getUTCFullYear();
      }) // avoid things like -0800
      .tickPadding(0);

      this.axisGroup = this.svg.append('g').classed('time axis', true).attr('transform', 'translate(0, ' + this.opts.miniChartHeight / 2 + ')').call(this.axis);
    }
  }, {
    key: 'drawSeries',
    value: function drawSeries() {
      this.seriesGroup = this.svg.append('g').classed('tjs-series', true);
      var rangesSeriesPath = this.seriesGroup.append('path').classed('tjs-series-path tjs-ranges', true);
      var pointsSeriesPath = this.seriesGroup.append('path').classed('tjs-series-path tjs-points', true);
      var seriesViews = this.timelineView.mainChart.seriesViews;

      this.rowCount = Math.floor(this.opts.miniChartHeight / ROW_HEIGHT);
      this.rowHeight = this.opts.miniChartHeight / this.rowCount;

      var seriesRows = seriesViews[0].rows;
      var rowRatio = seriesRows.length / this.rowCount;
      var rows = void 0;
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
      for (var i = 0; i < rows.length; ++i) {
        this.drawRow(rows[i], i);
      }rangesSeriesPath.attr({
        d: this.rangesPathD,
        'stroke-width': (this.rowHeight - ROW_PADDING).toFixed(2)
      });
      pointsSeriesPath.attr({
        d: this.pointsPathD,
        'stroke-width': (this.rowHeight - ROW_PADDING).toFixed(2)
      });
    }
  }, {
    key: 'drawRow',
    value: function drawRow(row, i) {
      var yPos = this.opts.miniChartHeight - this.rowHeight * i - this.rowHeight / 2;
      for (var j = 0; j < row.length; ++j) {
        var start = this.xScale(row[j].itemStart);
        var end = this.xScale(row[j].itemEnd);
        var d = ' M ' + start.toFixed(2) + ',' + yPos.toFixed(2) + ' H ' + end.toFixed(2);
        if (start == end) this.pointsPathD += d;else this.rangesPathD += d;
      }
    }
  }, {
    key: 'makeViewFieldRect',
    value: function makeViewFieldRect() {
      this.viewFieldRect = this.svg.append('rect').classed('viewfield', true);
    }
  }, {
    key: 'updateViewFieldRect',
    value: function updateViewFieldRect() {
      var mainChart = this.timelineView.mainChart.container.node();
      var miniChartDims = {
        width: this.svg.node().width.baseVal.value,
        height: this.opts.miniChartHeight
      };
      var mainChartDims = mainChart.getBoundingClientRect(); // FIXME use 'cached' values
      var rectWidth = Math.min(this.xScale(mainChartDims.width), miniChartDims.width);
      var rectHeight = Math.min(this.yScale(mainChartDims.height), miniChartDims.height);
      var rectX = (0, _utils.BOUND)(this.xScale(mainChart.scrollLeft), 0, miniChartDims.width - rectWidth);
      var rectY = (0, _utils.BOUND)(this.yScale(mainChart.scrollTop), 0, miniChartDims.height - rectHeight);

      this.viewFieldRect.attr({
        x: rectX.toFixed(2),
        y: rectY.toFixed(2),
        width: (rectWidth - 1).toFixed(2),
        height: (rectHeight - 1).toFixed(2)
      });
    }
  }, {
    key: 'updateAxes',
    value: function updateAxes() {
      this.fitAxisLabels();
    }
  }, {
    key: 'drawNowMarker',
    value: function drawNowMarker() {
      var now = Date.now();
      this.markersGroup = this.svg.append('g').classed('tjs-markers', true);
      var pos = this.xScale(this.mainChart.scale(now));
      this.markersGroup.append('line').classed('tjs-marker', true).attr({
        x1: pos.toFixed(2),
        x2: pos.toFixed(2),
        y2: this.opts.miniChartHeight.toFixed(2)
      });
    }
  }, {
    key: 'fitAxisLabels',
    value: function fitAxisLabels() {
      // Ensure far left/far right fit on screen
      var bbox = this.axisGroup.node().getBBox();

      if (bbox.x < 0) {
        // left needs to be pushed in
        _getNthTickText(this.axisGroup.node(), 0).style['text-anchor'] = "start";
      }
      if (bbox.width > this.svg.node().width.baseVal.value) {
        // right needs to be pushed in
        _getNthTickText(this.axisGroup.node(), -1).style['text-anchor'] = "end";
      }
    }
  }, {
    key: 'bindScrollEvents',
    value: function bindScrollEvents() {
      this.throttledScrollHandler = this.throttledScrollHandler || (0, _utils.throttle)(this.updateViewFieldRect.bind(this), 40);
      this.timelineView.mainChart.container.on('scroll', this.throttledScrollHandler);
    }
  }, {
    key: 'unbindScrollEvents',
    value: function unbindScrollEvents() {
      this.timelineView.mainChart.container.on('scroll', null);
    }
  }, {
    key: 'bindDragEvents',
    value: function bindDragEvents() {
      var svg = this.svg;
      var viewFieldRect = this.viewFieldRect;
      var miniChartHeight = this.opts.miniChartHeight;

      var miniChartWidth = svg.node().width.baseVal.value;
      var mainChartContainer = this.timelineView.mainChart.container;
      var xScale = this.xScale;
      var yScale = this.yScale;

      var miniChart = this;
      var mouseToBoxRatio = { x: 0.5, y: 0.5 }; // where the mouse is in the box

      svg.on('mousedown', startDrag);
      svg.on('touchstart', startDrag);

      function startDrag() {
        miniChart.unbindScrollEvents();
        if (d3.event.target == viewFieldRect.node()) {
          var mouse = d3.mouse(viewFieldRect.node());
          mouseToBoxRatio.x = (mouse[0] - viewFieldRect.attr('x')) / viewFieldRect.attr('width');
          mouseToBoxRatio.y = (mouse[1] - viewFieldRect.attr('y')) / viewFieldRect.attr('height');
        } else {
          mouseToBoxRatio = { x: 0.5, y: 0.5 };
        }

        dragMain();
        d3.select(document).on('mousemove.tjs', dragMain);
        d3.select(document).on('touchmove.tjs', dragMain);

        d3.select(document).on('mouseup.tjs', endDrag);
        d3.select(document).on('touchend.tjs', endDrag);
      }

      function dragMain() {
        var mousePos = d3.mouse(svg.node());

        var boxPos = {
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
  }]);

  return TimelineMiniChart;
}();

/**
 * Get the text element of the nth tick
 * @param  {SVGElement} el the axis element containing the ticks
 * @param  {number} n the index to get. Negatives are removed from end. Must be in range!
 * @return {SVGELement|Null} the nth tick text element
 */


exports.default = TimelineMiniChart;
function _getNthTickText(axis, n) {
  if (n < 0) n = axis.children.length + n - 1; // -1 for path
  return axis.children[n].children[1];
}

/**
 * Condenses rows of ranges into n rows
 * @param  {Array[]} rows  Array of array of ranges
 * @param  {number} n the length of the new array
 * @return {Array[]} new array with the desired length
 */
function _condenseRows(rows, n) {
  var ratio = rows.length / n;
  var result = [];

  for (var i = 0; !(0, _utils.approxEqual)(i, rows.length); i += ratio) {
    var newRow = [];

    // get the elements from the next desired rows
    for (var j = Math.floor(i); j < Math.floor(i + ratio); ++j) {
      for (var k = 0; k < rows[j].length; ++k) {
        newRow.push({ itemStart: rows[j][k].itemStart, itemEnd: rows[j][k].itemEnd });
      }
    }

    // merge any consecutive ranges that can be merge (greedy alg!)
    newRow.sort((0, _utils.ASC)('itemStart'));
    for (var _j = 1; _j < newRow.length; ++_j) {
      if (newRow[_j].itemStart <= newRow[_j - 1].itemEnd) {
        newRow[_j].itemStart = newRow[_j - 1].itemStart;
        newRow[_j].itemEnd = Math.max(newRow[_j].itemEnd, newRow[_j - 1].itemEnd);
        newRow[_j - 1] = null;
      }
    }

    result.push(newRow.filter(_utils.identity));
  }
  return result;
}

},{"../utils":9}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _TimelineMainChart = require("./TimelineMainChart.js");

var _TimelineMainChart2 = _interopRequireDefault(_TimelineMainChart);

var _TimelineMiniChart = require("./TimelineMiniChart.js");

var _TimelineMiniChart2 = _interopRequireDefault(_TimelineMiniChart);

var _TimelineAxis = require("./TimelineAxis.js");

var _TimelineAxis2 = _interopRequireDefault(_TimelineAxis);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TimelineView = function TimelineView(timeline) {
  _classCallCheck(this, TimelineView);

  this.model = timeline;
  var parent = timeline.parent;


  this.container = d3.select(parent).append('div').classed('tjs-container', true);

  this.mainChart = new _TimelineMainChart2.default(this);
  this.miniChart = new _TimelineMiniChart2.default(this);
  this.axis = new _TimelineAxis2.default(this);

  this.mainChart.scrollToBottom();
};

exports.default = TimelineView;

},{"./TimelineAxis.js":5,"./TimelineMainChart.js":6,"./TimelineMiniChart.js":7}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ASC = ASC;
exports.DESC = DESC;
exports.identity = identity;
exports.isBetween = isBetween;
exports.approxEqual = approxEqual;
exports.BOUND = BOUND;
exports.tightwrapViewBox = tightwrapViewBox;
exports.throttle = throttle;
exports.onAnimationFrame = onAnimationFrame;
exports.dateToTimestamp = dateToTimestamp;
exports.msToYears = msToYears;
var time = exports.time = {
  oneYear: 3.154e+10
};
var EPSILON = 1e-10;

/**
 * Numeric Array.sort function which returns results in ascending order.
 * @param {string} [key] if sorting objects, supply the key to use
 * @example [5,2,1,4].sort(ASC);
 * @example [{x:3},{x:5},{x:1},{x:9}].sort(ASC('x'))
 */
function ASC(key) {
  if (arguments.length == 2) return arguments[0] - arguments[1];else return function (a, b) {
    return a[key] - b[key];
  };
}

/**
 * Numeric Array.sort function which returns results in descending order.
 * @param {string} [key] if sorting objects, supply the key to use
 * @example [5,2,1,4].sort(DESC);
 * @example [{x:3},{x:5},{x:1},{x:9}].sort(DESC('x'))
 */
function DESC(key) {
  if (arguments.length == 2) return arguments[1] - arguments[0];else return function (a, b) {
    return b[key] - a[key];
  };
}

/**
 * Returns what you give
 * @param  {*} x
 * @return {*}
 * @example [null, false, true, 34].filter(identity) == [true,34]
 */
function identity(x) {
  return x;
}

/**
 * Check if val is between the given values
 * @param  {number}  val the value to check
 * @param  {number}  lo  the lower boundary
 * @param  {number}  hi  the upper boundary
 * @return {Boolean} If val is between lo and hi
 */
function isBetween(val, lo, hi) {
  return lo < val && val < hi;
}

/**
 * Check if two values are approximately equal
 * @param  {number} a
 * @param  {number} b
 * @param  {number} [epsilon=EPSILON] definition of 'approximately'. Defaults
 *                                    to a small number.
 * @return {Boolean} Whether a is within epsilon of b
 */
function approxEqual(a, b) {
  var epsilon = arguments.length <= 2 || arguments[2] === undefined ? EPSILON : arguments[2];

  return a == b || isBetween(b, a - epsilon, a + epsilon);
}

/**
 * Bound val between lo and hi
 * @param {number} val the number to be bounded
 * @param {number} lo  lower bound
 * @param {number} hi  upper bound
 * @return {number} the bounded number
 */
function BOUND(val, lo, hi) {
  return Math.max(lo, Math.min(val, hi));
}

/**
 * Change an SVG's viewbox to match it's children
 * @param {D3Select} svg the svg element
 */
function tightwrapViewBox(svg) {
  var bbox = svg.node().getBBox();
  for (var k in bbox) {
    bbox[k] = bbox[k].toFixed(2);
  }svg.attr({
    viewBox: bbox.x + ' ' + bbox.y + ' ' + bbox.width + ' ' + bbox.height,
    width: bbox.width,
    height: bbox.height
  });
}

/**
 * Ensures the provided function is never executed more than once every 50 ms
 * (or whatever is provided). Useful as a scroll/resize event handler wrapper.
 * @param  {Function} fn      the thing we want to limit calls to
 * @param  {number}   [ms=50] how frequently the fn can be executed
 * @return {Function}         the handler
 */
function throttle(fn) {
  var ms = arguments.length <= 1 || arguments[1] === undefined ? 50 : arguments[1];

  var timer = null;
  var context = this,
      args = [];
  var clear = function clear() {
    clearTimeout(timer);
    timer = null;
  };
  var handler = function handler() {
    context = this;
    args = arguments;
    if (!timer) {
      fn.apply(context, args);
      timer = setTimeout(clear, ms);
    }
  };

  return handler;
}

/**
 * Calls the given fn on the next animation frame. Fallsback to throttling if
 * requestAnimationFrame is not supported.
 * @param  {Function} fn the thing we want to limit calls to
 * @return {Function} the handler
 */
function onAnimationFrame(fn) {
  if (!window.requestAnimationFrame) return throttle(fn, 40);
  var handler = function handler() {
    var _this = this,
        _arguments = arguments;

    window.requestAnimationFrame(function () {
      return fn.apply(_this, _arguments);
    });
  };

  return handler;
}

/**
 * Convert a date or timestamp to a timestamp. Falls back to a default value if
 * date is undefined.
 * @param  {Date|number} date the date to convert
 * @param  {number|NaN}  [defDate=NaN] default date to use
 * @return {number} returns NaN on exceptional cases.
 */
function dateToTimestamp(date) {
  var defDate = arguments.length <= 1 || arguments[1] === undefined ? NaN : arguments[1];

  if (typeof date == 'undefined') return defDate;else if (typeof date == 'number') return date;else if (date instanceof Date) return date.getTime();else return NaN;
}

/**
 * Converts ms to years
 * @param {number} ms
 * @return {number} years
 */
function msToYears(ms) {
  return ms / 3.15569e10;
}

},{}]},{},[1]);
