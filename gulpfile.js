'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var autoprefixer = require('autoprefixer');
var server = require('browser-sync').create();

gulp.task('clean', function () {
  return del('build/**');
});

gulp.task('copy', function () {
  return gulp.src([
    'source/fonts/**/*.{woff,woff2}',
    'source/js/**/{jquery,slick}*.js'
  ], {base: 'source'})
    .pipe(gulp.dest('build'));
});

gulp.task('css', function () {
  return gulp.src('source/less/style.less')
    .pipe($.plumber())
    .pipe($.less())
    .pipe($.postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest('build/css'))
    .pipe($.csso())
    .pipe($.rename('style.min.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream());
});

gulp.task('html', function () {
  return gulp.src('source/*.html')
    .pipe($.htmlmin({
      // collapseWhitespace: true,
      removeAttributeQuotes: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeRedundantAttributes: true
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('js', function () {
  return gulp.src(['source/js/**/*.js', '!source/js/**/{jquery,slick}*.js'])
    .pipe(gulp.dest('build/js'))
    .pipe($.uglify())
    .pipe($.rename({suffix: '.min'}))
    .pipe(gulp.dest('build/js'));
});

gulp.task('imagemin', function () {
  return gulp.src('source/img/**/*.{png,jpg,gif,svg}')
    .pipe($.cache($.imagemin([
      $.imagemin.gifsicle({optimizationLevel: 3}),
      $.imagemin.optipng({optimizationLevel: 3}),
      $.imagemin.jpegtran({progressive: true}),
      $.imagemin.svgo({
        plugins: [
          {inlineStyles: {onlyMatchedOnce: false}},
          {cleanupListOfValues: {floatPrecision: 1}}
        ]
      })
    ])))
    .pipe(gulp.dest('build/img'));
});

gulp.task('webp', function () {
  return gulp.src('source/img/**/*.{png,jpg}')
    .pipe($.webp({quality: 90}))
    .pipe(gulp.dest('build/img'));
});

gulp.task('clear', function (done) {
  $.cache.clearAll();
  done();
});

gulp.task('refresh', function (done) {
  server.reload();
  done();
});

gulp.task('server', function () {
  server.init({
    server: 'build/',
    notify: false,
    open: true,
    cors: true,
    ui: false
  });
  gulp.watch('source/less/**/*.less', gulp.series('css'));
  gulp.watch('source/js/**/*.js', gulp.series('js', 'refresh'));
  gulp.watch('source/*.html', gulp.series('html', 'refresh'));
});

gulp.task('images', gulp.series('imagemin', 'webp'));
gulp.task('build', gulp.series('clean', 'copy', 'css', 'js', 'html', 'images'));
gulp.task('start', gulp.series('build', 'server'));
