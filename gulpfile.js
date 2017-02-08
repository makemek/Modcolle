'use strict'

const appPort = process.env.PORT
const devPort = process.env.PORT_DEV
const css = 'src/views/*.css'
const htmlTemplate = 'src/views/**/*.hbs'

const gulp = require('gulp')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const cleanCSS = require('gulp-clean-css')
const rename = require('gulp-rename')
const bs = require('browser-sync').create()
const nodemon = require('gulp-nodemon')

gulp.task('build', ['build:css'])

gulp.task('build:css', () => {
  return gulp.src(css)
  .pipe(rename({suffix: '.min'}))
  .pipe(postcss([autoprefixer()]))
  .pipe(cleanCSS())
  .pipe(gulp.dest('src/views/public/css'))
  .pipe(bs.stream())
})

gulp.task('nodemon', done => {
  let start = false
  return nodemon({
    script: 'bin/www',
    ignore: ['gulpfile.js', 'node_modules/', 'src/views/'],
    env: {PORT: appPort}
  })
  .on('start', () => {
    if(!start) {
      start = true
      done()
    }
  })
})

gulp.task('browser-sync', ['nodemon'], () => {
  bs.init({
    proxy: `localhost:${appPort}`,
    port: devPort,
    open: false
  })

  gulp.watch(css, ['build:css'])
  gulp.watch(htmlTemplate, bs.reload)
})
