/**
 *
 * Friseur Schmitt gulpfile.js
 *
 */

var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var browserSync = require('browser-sync').create();
var moduleImporter = require('sass-module-importer');
var runSequence = require('run-sequence');
var dotenv = require('dotenv');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var notifier = require('node-notifier');
var path = require('path');
var fs = require('fs');
var browserify = require('browserify');
var envify = require('envify');
var babelify = require('babelify');
var buffer = require('vinyl-buffer');
var pug = require('gulp-pug');
var beeper = require('beeper');


// Setup & Configuration
// ==============================

// Read .env file and store its contents in process.env variable
dotenv.config();

// NODE_ENV, should default to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// store all gulp plugins in $
const $ = gulpLoadPlugins();

// Configuration
var config = {};

// base
config.siteName = 'Friseur Schmitt';
config.serverDir = './build/'

// destination directories
config.dest = 'build/';
config.destJS = config.dest + 'js';
config.destCSS = config.dest + 'css';
config.destSVG = config.dest + 'images/svg';
config.destIMG = config.dest + 'images/layout';
config.destFonts = config.dest + 'fonts';

// entry files
config.entries = {
  scss: 'src/css/main.scss',
  js: 'src/js/main.js',
  pug: 'src/templates/pages/*.pug',
}

// globs
config.globs = {
  scss: 'src/css/**/*.scss',
  js: 'src/js/**/*.js',
  svg: 'src/images/svg/*.svg',
  img: 'src/images/layout/**/*',
  fonts: 'src/fonts/**/*',
  pug: 'src/templates/**/*.pug',
};


// Environment handling tasks
// ==============================
gulp.task('set-dev-node-env', function() {
  return process.env.NODE_ENV = 'development';
});

gulp.task('set-prod-node-env', function() {
  return process.env.NODE_ENV = 'production';
});


// Notification icons
// ==============================

/**
 * Checks to see if a file exists.
 */
function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
}

// Get success icon
const iconPathSuccess = path.join(__dirname, 'gulp/icon--success.png');
const iconSuccess = fileExists(iconPathSuccess) ? iconPathSuccess : null;

// Get error icon
const iconPathError = path.join(__dirname, 'gulp/icon--error.png');
const iconError = fileExists(iconPathError) ? iconPathError : null;


// Plumber error handler
// ==============================
function plumberErrorHandler(err) {
  // notify by console log
  $.util.log($.util.colors.white.bgRed("Build error:"), err.message);

  beeper();

  // notify by notification
  notifier.notify({
    title: config.siteName,
    message: 'Build error! "' + err.message + '"',
    icon: iconError
  });

  this.emit('end');
}


// BROWSERSYNC
// ======================
gulp.task('browsersync', function() {
  // generates a port from a string
  function port (str, base = 3000) {
      return str
      .split("")
      .map((c, i) => c.charCodeAt(0) + i)
      .reduce((a, c) => a + c, 0) + base
  }

  // Inits browsersync
  browserSync.init({
    server: {
      baseDir: config.serverDir,
    },
    port: port(config.siteName) // port based on project name
  });
});

gulp.task('browsersync:reload', function() {
  return browserSync.reload();
});


// PUG TASKS
// ==============================

/**
 * Build the pug templates
 */
gulp.task('pug-build', function buildHTML() {
  return gulp.src(config.entries.pug)
  .pipe($.plumber({
    errorHandler: plumberErrorHandler
  }))
  .pipe(pug({
    pretty: process.env.NODE_ENV === 'development',
  }))
  .pipe(gulp.dest(config.dest))
});

/**
 * Rebuild Pug & do page reload
 */
gulp.task('pug-rebuild', ['pug-build'], function() {
  browserSync.reload();
});


// STYLES TASK
// Compiles files from _scss into /_site/css and /css
// Also does the usual autoprefixer/minify/linting stuff
// ==============================
var postCSSPostProcessors = [
  autoprefixer(),
  cssnano({
    preset: 'default',
  }),
];

gulp.task('sass', ['stylelint'], function() {
  return gulp.src(config.entries.scss)
    .pipe($.plumber({
      errorHandler: plumberErrorHandler
    }))
    .pipe($.if(process.env.NODE_ENV === 'development', $.sourcemaps.init()))
    .pipe($.sass({
      importer: moduleImporter(),
      outputStyle: ':compact',
      precision: 10
    }))
    .pipe($.postcss(postCSSPostProcessors))
    .pipe($.rename({
      suffix: '.min'
    }))
    .pipe($.size({
      showFiles: true
    }))
    .pipe($.if(process.env.NODE_ENV === 'development', $.sourcemaps.write('./')))
    .pipe(gulp.dest(config.destCSS))
    .pipe(browserSync.reload({
      stream: true
    }));
});


// STYLELINT TASK: Lint SCSS
// ==============================
gulp.task('stylelint', function () {
  return gulp.src(config.globs.scss)
    .pipe($.stylelint({
      failAfterError: false,
      reporters: [{
        formatter: 'string',
        console: true,
      }]
    }));
});


// SCRIPTS TASK: Babelify, bundle, lint and minify JavaScript.
//
// Note:
// * ES6 is supported
// * that includes ES6 imports via browserify + babelify.
// ==============================

// TODO: Upgrade to babel 7
// TODO: Check babel-polyfill + preset-env

gulp.task('scripts', ['eslint'], function() {
  // log NODE_ENV
  $.util.log('Building scripts with NODE_ENV:', process.env.NODE_ENV);

  return gulp.src(config.entries.js, {
      read: false
    })
    .pipe($.plumber({
      errorHandler: plumberErrorHandler
    }))
    .pipe($.tap(function(file) {
      // browserify inside gulp-tap, so plumbering still works.
      file.contents = browserify({
          entries: [file.path],
          debug: process.env.NODE_ENV === 'development'
        })
        .transform(envify, {
          _: 'purge',
          global: true
        })
        .transform(babelify)
        .bundle();
    }))
    .pipe(buffer()) // converts bundled stream, so it can be further processed
    .pipe($.rename({
      suffix: '.min'
    }))
    .pipe($.if(process.env.NODE_ENV === 'development', $.sourcemaps.init({
      loadMaps: true
    })))
    .pipe($.uglify())
    .pipe($.size({
      showFiles: true
    }))
    .pipe($.if(process.env.NODE_ENV === 'development', $.sourcemaps.write('./')))
    .pipe(gulp.dest(config.destJS))
    .pipe(browserSync.reload({
      stream: true
    }));
});


// ESLINT TASK: Lint JavaScript
// ==============================
gulp.task('eslint', function() {
  return gulp.src([config.globs.js])
    .pipe($.eslint())
    .pipe($.eslint.format())
});


// SVG TASK: Create SVG spritemap
// ==============================
gulp.task('svg', function() {
  var svgSpriteConfig = {
    log: 'info',
    svg: {
      namespaceClassnames: false
    },
    mode: {
      symbol: {
        dest: '.',
        sprite: 'sprite.svg'
      }
    }
  };

  return gulp.src(config.globs.svg)
    .pipe($.plumber({
      errorHandler: plumberErrorHandler
    }))
    .pipe($.svgSprite(svgSpriteConfig))
    .pipe(gulp.dest(config.destSVG))
});

/**
 * Rebuild SVGs & do page reload
 */
gulp.task('svg-rebuild', ['svg'], function() {
  browserSync.reload();
});

// IMG TASK: Simply copy images
// ==============================
gulp.task('img', function() {
  return gulp.src(config.globs.img)
    .pipe($.plumber({
      errorHandler: plumberErrorHandler
    }))
    .pipe(gulp.dest(config.destIMG))
});

/**
 * Rebuild images & do page reload
 */
gulp.task('img-rebuild', ['img'], function() {
  browserSync.reload();
});


// FONTS TASK: Move all fonts in a flattened directory
// ==============================
gulp.task('fonts', () => (
  gulp.src(config.globs.fonts)
    .pipe($.flatten())
    .pipe(gulp.dest(config.destFonts))
    .pipe(browserSync.stream())
));


// WATCH TASK: Watch files for changes
// ==============================
gulp.task('watch', function() {
  // watch all .scss files, recompile SASS
  $.watch(config.globs.scss, function(vinyl) {
    $.util.log($.util.colors.underline('\nFile changed: ' + vinyl.relative));
    gulp.start('sass');
  });

  // watch all script files, recompile scripts
  $.watch(config.globs.js, function(vinyl) {
    $.util.log($.util.colors.underline('\nFile changed: ' + vinyl.relative));
    gulp.start('scripts');
  });

  // watch all svg files, recompile SVG spritemap
  $.watch(config.globs.svg, function(vinyl) {
    $.util.log($.util.colors.underline('\nFile changed: ' + vinyl.relative));
    gulp.start('svg-rebuild');
  });

  // watch all image files, recopy images
  $.watch(config.globs.img, function(vinyl) {
    $.util.log($.util.colors.underline('\nFile changed: ' + vinyl.relative));
    gulp.start('img-rebuild');
  });

  // watch all font files, recopy fonts
  $.watch(config.globs.fonts, function(vinyl) {
    $.util.log($.util.colors.underline('\nFile changed: ' + vinyl.relative));
    gulp.start('fonts');
  });

  // watch all pug template files, recompile them
  $.watch(config.globs.pug, function(vinyl) {
    $.util.log($.util.colors.underline('\nFile changed: ' + vinyl.relative));
    gulp.start('pug-rebuild');
  });
});


// DEFAULT TASK: Build files and serve browsersync
// ==============================
gulp.task('default', callback =>
  runSequence(
    ['sass', 'scripts', 'svg', 'img', 'fonts', 'pug-build'],
    'browsersync',
    'watch',
    callback
  )
);


// PRODUCTION TASK: Set NODE_ENV to production and build files
// ==============================
gulp.task('production', callback =>
  runSequence(
    'set-prod-node-env',
    ['sass', 'scripts', 'svg', 'img', 'fonts', 'pug-build'],
    callback
  )
);
