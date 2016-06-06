d3.json("Bond Films.json", function (json) {
  var series = new TimelineSeries(json);
  series.accessors.define({
    start: d => new Date(d.pub).getTime(),
    end:   d => new Date(d.pub).getTime(),
    title: d => d.filmLabel,
    link:  d => d.film
  });

  var tl = new Timeline(series).drawIn(document.getElementById('bond-films'));
});

d3.json("American TV Shows.json", function (json) {
  var series = new TimelineSeries(json);
  var now = Date.now();
  series.accessors.define({
    start: d => new Date(d.start).getTime(),
    end:   d => d.end ? new Date(d.end).getTime() : now,
    title: d => d.xLabel,
    link:  d => d.x
  });

  var tl = new Timeline(series).drawIn(document.getElementById('tv-shows'));
});
