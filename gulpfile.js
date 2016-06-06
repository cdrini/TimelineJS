/* jshint node:true */
var gulp = require('gulp');

var source = require('vinyl-source-stream');
var browserify = require('browserify');
var babelify = require('babelify');


gulp.task('babel', function () {
  var b = browserify({
    entries: 'source/Timeline.js',
    // debug: true,
    transform: [ babelify ]
  });

  return b
    .bundle()
    .pipe(source('Timeline.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', ['babel'], function () {
  gulp.watch('source/**/*.js', ['babel']);
});
