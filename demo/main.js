d3.json("bond films.json", function (json) {
  var series = new TimelineSeries(json);
  series.accessors.define({
    start: d => new Date(d.pubDate).getTime(),
    end:   d => new Date(d.pubDate).getTime(),
    title: d => d.filmLabel,
    link:  d => d.film
  });

  var tl = new Timeline(series).drawIn(document.getElementById('bond-films'));
});

d3.json("American TV Shows.json", function (json) {
  var series = new TimelineSeries(json);
  series.accessors.define({
    start: d => new Date(d.startTime).getTime(),
    end:   d => d.endTime ? new Date(d.endTime).getTime() : Date.now(),
    title: d => d.showLabel,
    link:  d => d.show
  });

  var tl = new Timeline(series).drawIn(document.getElementById('tv-shows'));
});
