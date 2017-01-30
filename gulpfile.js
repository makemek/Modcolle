'use strict'

const gulp = require('gulp')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const cleanCSS = require('gulp-clean-css')
const rename = require('gulp-rename')

const css = 'src/views/*.css'

gulp.task('build', ['build:css'])

gulp.task('build:css', () => {
  return gulp.src(css)
  .pipe(rename({suffix: '.min'}))
  .pipe(postcss([autoprefixer()]))
  .pipe(cleanCSS())
  .pipe(gulp.dest('src/views/public/css'))
})

gulp.task('watch', () => {
  gulp.watch(css, ['build:css'])
})
