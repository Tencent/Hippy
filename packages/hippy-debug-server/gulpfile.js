'use strict';

const gulp = require('gulp');
const ts = require('gulp-typescript');
const clean = require('gulp-clean');

gulp.task('mkdir', () => {
  return gulp.src('*.*', {read: false})
  .pipe(gulp.dest('./dist'));
})

gulp.task('compile', () => {
  return gulp.src(['src/**/*.ts'])
    .pipe(ts.createProject('tsconfig.json')())
    .pipe(gulp.dest('dist/'))
});

gulp.task('copy-resource', function() {
    return gulp.src(['src/build/**/*'])
      .pipe(gulp.dest('dist/build'));
});

gulp.task('clean', () => {
  return gulp.src('dist', {read: false}).pipe(clean({allowEmpty: true}));
})

gulp.task('default', gulp.series(['clean', 'mkdir', 'compile', 'copy-resource']));
