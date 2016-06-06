WORK-IN-PROGRESS

[DEMO](https://rawgit.com/cdrini/TimelineJS/master/demo/index.html)

How to use:

Add
- d3.js
- dist/Timeline.js
- dist/Timeline.css

Then do the following:
```js
var data = new TimelineSeries([
  { start: new Date(2000, 1, 1), end: new Date(2008, 2, 4), title: "Event 1" },
  { start: new Date(1990, 1, 1), end: new Date(2016, 2, 4), title: "Event 2" }
]);

new Timeline(data).drawIn(document.getElementById("timeline"));
```
