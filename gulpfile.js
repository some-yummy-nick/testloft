'use strict';

var gulp = require('gulp'),
  changed = require('gulp-changed'),
  babel = require("gulp-babel"),
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
  del = require('del'),
  ghPages = require('gulp-gh-pages'),
  browserSync = require('browser-sync'),
  reload = browserSync.reload,
  sourcemaps = require('gulp-sourcemaps'),
  postcss = require('gulp-postcss'),
  precss = require('precss'),
  easysprite = require('postcss-easysprites'),
  source = require('vinyl-source-stream'),
  sorting = require('postcss-sorting'),
  mqpacker = require('css-mqpacker'),
  path = require('path'),
  browserify = require('browserify');

gulp.task('default', ['watch', 'browserSync', 'css', 'html', 'js', 'image', 'copy']);

gulp.task('css', function () {
  var processors = [
        precss,
        easysprite({
      imagePath: './source/img',
      spritePath: './source/img'
    }),

    require("postcss-cssnext")({
      browsers: ['last 3 version']
    }),
        require('postcss-custom-media')(),
        sorting({
      'sort-order': 'csscomb'
    }),
        mqpacker({
      sort: true
    })
    ];
  gulp.src('./source/style/style.css')
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(postcss(processors))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./build/style'))
    .pipe(reload({
      stream: true
    }));
});

gulp.task('css:build', function () {
  var processors = [
        precss,
        require("postcss-cssnext")({
      browsers: ['last 3 version']
    }),
        easysprite({
      imagePath: './source/img',
      spritePath: './source/img'
    }),
        require('postcss-custom-media')(),
        sorting({
      'sort-order': 'csscomb'
    }),
        require('postcss-short')({}),
        mqpacker({
      sort: true
    }),
    require("csswring")()
    ];
  gulp.src('./source/style/style.css')
    .pipe(postcss(processors))
    .pipe(gulp.dest('./build/style'))
});

gulp.task('html', function () {
  return gulp.src('source/*.html')
    .pipe(rigger())
    .pipe(gulp.dest('build/'))
    .pipe(reload({
      stream: true
    }));
});

gulp.task('html:build', function () {
  return gulp.src('source/*.html')
    .pipe(rigger())
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest('build/'))
});

gulp.task('js', function () {
  gulp.src('source/js/script.js') // return не нужен чтобы plumber не вылетал
    .pipe(plumber())
    .pipe(rigger())
    .pipe(gulp.dest('build/js'))
    .pipe(reload({
      stream: true
    }));
});

//gulp.task('js', function () {
//  return browserify('./source/js/script.js')
//    .bundle({
//      debug: true
//    })
//    .pipe(source('script.js'))
//    .pipe(gulp.dest('build/js'));
//});

//gulp.task('js', () =>
//  gulp.src('./source/js/script.js')
//  .pipe(babel({
//    presets: ['es2015']
//  }))
//  .pipe(gulp.dest('build/js'))
//);

gulp.task('js:build', function () {
  gulp.src('source/js/script.js') // return не нужен чтобы plumber не вылетал
    .pipe(rigger())
    .pipe(uglify())
    .pipe(gulp.dest('build/js'))
});

gulp.task('image', function () {
  gulp.src('source/img/*.*')
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

gulp.task('browserSync', function () {
  browserSync({
    server: {
      baseDir: './build'
    },
    open: false,
    notify: false
  });
});

gulp.task('clean', function () {
  return del.sync('build');
});

gulp.task('copy', function () {
  gulp.src('source/fonts/**/*.*')
    .pipe(changed('./build/fonts/'))
    .pipe(gulp.dest('./build/fonts/'))
  gulp.src('source/lib/**/*.*')
    .pipe(changed('./build/lib/'))
    .pipe(gulp.dest('./build/lib/'))
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

gulp.task('build', [
    'clean',
    'copy',
    'css:build',
    'html:build',
    'js:build',
    'image'
]);