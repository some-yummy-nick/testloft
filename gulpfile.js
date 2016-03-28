'use strict';

var gulp = require('gulp'),
  changed = require('gulp-changed'),
  rigger = require('gulp-rigger'),
  htmlmin = require('gulp-htmlmin'),
  plumber = require('gulp-plumber'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  cache = require('gulp-cache'),
  imagemin = require('gulp-imagemin'),
  pngquant = require('imagemin-pngquant'),
  svgstore = require('gulp-svgstore'),
  svgmin = require('gulp-svgmin'),
  spritesmith = require('gulp.spritesmith'),
  del = require('del'),
  ghPages = require('gulp-gh-pages'),
  browserSync = require('browser-sync'),
  reload = browserSync.reload,
  sourcemaps = require('gulp-sourcemaps'),
  postcss = require('gulp-postcss'),
  autoprefixer = require('autoprefixer'),
  precss = require('precss'),
  mqpacker = require('css-mqpacker'),
  cssnext = require('cssnext');

gulp.task('default', ['watch', 'browserSync', 'css', 'html', 'js', 'image']);

gulp.task('css', function () {
  var processors = [
        precss,
        autoprefixer({
      browsers: ['last 3 version']
    }),
        cssnext,
        require('postcss-sorting')({
      'sort-order': 'csscomb'
    }),
        mqpacker({
      sort: true
    }),
    require("csswring")()
    ];
  return gulp.src('./source/style/style.css')
    .pipe(sourcemaps.init())
    .pipe(postcss(processors))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./build/style'))
    .pipe(reload({
      stream: true
    }));
});

gulp.task('html', function () {
  return gulp.src('source/*.html')
    .pipe(changed('build/'))
    .pipe(rigger())
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest('build/'))
    .pipe(reload({
      stream: true
    }));
});

gulp.task('js', function () {
  gulp.src('source/js/script.js') // return не нужен чтобы plumber не вылетал
    .pipe(plumber())
    .pipe(rigger())
    .pipe(gulp.dest('build/js'))
    .pipe(uglify())
    .pipe(rename('script.min.js'))
    .pipe(gulp.dest('build/js'))
    .pipe(reload({
      stream: true
    }));
});
gulp.task('image', function () {
  return gulp.src('source/img/*.*')
    .pipe(changed('build/img'))
    .pipe(cache(imagemin({
      interlaced: true,
      progressive: true,
      use: [pngquant()]
    })))
    .pipe(gulp.dest('build/img'))
    .pipe(reload({
      stream: true
    }));
});

gulp.task('svg', function () {
  return gulp
    .src('source/img/svg/*.svg')
    .pipe(svgmin(function (file) {
      var prefix = path.basename(file.relative, path.extname(file.relative));
      return {
        plugins: [{
          cleanupIDs: {
            prefix: prefix + '-',
            minify: true
          }
                }]
      };
    }))
    .pipe(svgstore())
    .pipe(gulp.dest('source/img/'));
});

gulp.task('sprite', function () {
  var spriteData =
    gulp.src('source/img/features-sprite/*.*')
    .pipe(spritesmith({
      imgName: 'sprite.png',
      cssName: 'sprite.scss',
      cssFormat: 'scss',
      imgPath: '../img/sprite.png'
    }));

  spriteData.img.pipe(gulp.dest('build/img/'));
  spriteData.css.pipe(gulp.dest('source/css/sprite/'));
});

gulp.task('browserSync', function () {
  browserSync({
    server: {
      baseDir: './build'
    },
    open: true,
    notify: false
  });
});

gulp.task('clean', function () {
  return del.sync('build');
});

gulp.task('deploy', function () {
  return gulp.src('./build/**/*')
    .pipe(ghPages());
});

gulp.task('watch', function () {
  gulp.watch('source/**/*.css', ['css']);
  gulp.watch('source/**/*.html', ['html']);
  gulp.watch('source/**/*.js', ['js']);
  gulp.watch('source/img/**/*.*', ['image']);
});