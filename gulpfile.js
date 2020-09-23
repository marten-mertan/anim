var { watch, src, dest, parallel, series } = require('gulp');
var browserSync = require('browser-sync');
var del = require('del');
var twig = require('gulp-twig');
var imagemin = require('gulp-imagemin');
var sass = require('gulp-sass');
var sassGlob = require('gulp-sass-glob');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var babel = require('gulp-babel');
var webpack = require('webpack-stream');

// Девсервер
function devServer(cb) {
  var params = {
    watch: true,
    reloadDebounce: 150,
    notify: false,
    server: { baseDir: 'docs' },
  };

  browserSync.create().init(params);
  cb();
}

// Сборка
function buildPages() {
    return src(['src/pages/*.twig', 'src/pages/*.html'])
      .pipe(twig())
      .pipe(dest('docs/'));
  }

function buildStyles() {
    return src(['src/styles/**/*.scss', 'src/styles/**/*.css'])
      .pipe(sassGlob())
      .pipe(sass())
      .pipe(postcss([
        autoprefixer()
      ]))
      .pipe(dest('docs/styles/'));
}

function buildVendorScripts() {
  return src('src/scripts/vendor/**/*.js')
    .pipe(babel({ presets: ['@babel/preset-env'] }))
    .pipe(dest('docs/scripts/vendor/'));
}

function buildScripts() {
  return src('src/scripts/index.js')
  .pipe(webpack({
    output:       {filename: 'bundle.js'},
    optimization: {minimize: false}
  }))
  .pipe(dest('docs/scripts/'));
}

function buildAssets(cb) {
    src(['src/assets/**/*.*', '!src/assets/img/**/*.*'])
      .pipe(dest('docs/'));
  
    src('src/assets/img/**/*.*')
      .pipe(imagemin())
      .pipe(dest('docs/assets/img'));
    cb();
  }

// Отслеживание
function watchFiles() {
    watch(['src/pages/*.twig', 'src/pages/*.html', 'src/components/**/*.twig'], buildPages);
    watch(['src/styles/*.css','src/styles/*.scss', 'src/components/**/*.scss'], buildStyles);
    watch('src/scripts/**/*.js', buildScripts);
    watch('src/assets/**/*.*', buildAssets);

  }

// Очистка билда
function clearBuild() {
    return del('docs/');
  }

exports.default =
  series(
    clearBuild,
    parallel(
      devServer,
      series(
        parallel(buildPages, buildStyles, buildScripts, buildVendorScripts, buildAssets),
        watchFiles
      )
    )
  );