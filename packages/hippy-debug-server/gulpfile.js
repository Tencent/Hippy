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

gulp.task('copy-resource', function(cb) {
  gulp.src(['src/build/**/*']).pipe(gulp.dest('dist/build'));
  gulp.src(['src/public/**/*']).pipe(gulp.dest('dist/public'));
  gulp.src(['src/@types/**/*']).pipe(gulp.dest('dist/@types'));
  cb();
});

gulp.task('clean', () => {
  return gulp.src('dist', {read: false}).pipe(clean({allowEmpty: true}));
})

gulp.task('default', gulp.series(['clean', 'mkdir', gulp.parallel(['compile', 'copy-resource'])]));
