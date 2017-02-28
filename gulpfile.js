'use strict'

require('dot-env')

const appPort = process.env.PORT || '5000'
const devPort = process.env.PORT_DEV || '3000'
const css = 'src/views/*.css'
const js = 'src/views/js/*.js'
const htmlTemplate = 'src/views/**/*.hbs'
const publicAssets = 'src/views/public'
const destination = {
  css: publicAssets + '/css',
  fonts: publicAssets + '/fonts',
  js: publicAssets + '/js'
}

const gulp = require('gulp')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const cleanCSS = require('gulp-clean-css')
const rename = require('gulp-rename')
const bs = require('browser-sync').create()
const nodemon = require('gulp-nodemon')
const uglify = require('gulp-uglify')
const babel = require('gulp-babel')
const gutil = require('gulp-util')
const source = require('vinyl-source-stream')
const browserify = require('browserify')
const buffer = require('vinyl-buffer')

gulp.task('build', ['build:css', 'build:js'])

gulp.task('build:css', () => {
  return gulp.src(css)
  .pipe(rename({suffix: '.min'}))
  .pipe(postcss([autoprefixer()]))
  .pipe(cleanCSS())
  .pipe(gulp.dest(destination.css))
  .pipe(bs.stream())
})

gulp.task('build:js', () => {
  browserify('src/views/js/')
  .bundle()
  .on('error', error => gutil.log(error))
  .pipe(source('bundle.min.js'))
  .pipe(buffer())
  .pipe(babel())
  .pipe(uglify())
  .pipe(gulp.dest(destination.js))
  .pipe(bs.stream())
})

gulp.task('import', ['environment-variables', 'font-awesome'])

gulp.task('environment-variables', () => {
  gulp.src('.env.template.json')
  .pipe(rename('.env.json'))
  .pipe(gulp.dest('.', {overwrite: false}))
})

gulp.task('font-awesome', () => {
  gulp.src('node_modules/font-awesome/css/font-awesome.min.css')
  .pipe(gulp.dest(destination.css))
  gulp.src('node_modules/font-awesome/fonts/*')
  .pipe(gulp.dest(destination.fonts))
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
  gulp.watch(js, ['build:js'])
  gulp.watch(htmlTemplate, bs.reload)
})
