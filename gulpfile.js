var gulp             = require( 'gulp' );
var sass             = require( 'gulp-sass' );
var browserSync      = require( 'browser-sync').create();
var useref           = require( 'gulp-useref' );
var autoprefixer     = require( 'gulp-autoprefixer' );
var uglify           = require( 'gulp-uglify' );
var gulpIf           = require( 'gulp-if' );
var cssnano          = require( 'gulp-cssnano' );
var del              = require( 'del' );
var cleanCSS         = require( 'gulp-clean-css' );
var stripCssComments = require( 'gulp-strip-css-comments' );
var imagemin         = require( 'gulp-imagemin' );
var svgstore         = require( 'gulp-svgstore' );
var svgmin           = require( 'gulp-svgmin' );
var rename           = require( 'gulp-rename' );
var size             = require( 'gulp-size' );
var sassdoc          = require( 'sassdoc' );
var sourcemaps       = require( 'gulp-sourcemaps' );


///////////////////
// CONFIGURATION //
///////////////////
var path = {
  // Work in Progress CONFIG
  sass: './app/scss/**/*.scss',
  sass_dest: './app/css',
  js: './app/js/**/*.js',
  img: './app/img/*',
  html: './app/*.html',
  svg: './app/icons/*.svg',
  svg_dest: './app/icons/dest',

  // Build CONFIG
  dist: './dist',
  js_dist: './dist/js',
  css_dist: './dist/css',
  img_dist: './dist/img',
  svg_dist: './dist/icons'
};

var autoprefixerOptions = {
  browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1']
};


////////////////
// NANO TASKS //
////////////////

// Sync task
gulp.task( 'browserSync', function(){
  browserSync.init( {
    server: {
      baseDir: 'app'
    },
  } )
} );


// Generate SassDoc + Add Sourcemaps + Autoprefixer 
// + cache modified files 
// + size the final css filereload on change
// + refresh stream
gulp.task( 'sass', function(){
  // Gets all files ending with .scss in app/scss and children dirs
  return gulp.src( path.sass )
    .pipe(sassdoc())
    .pipe(sourcemaps.init())
    .pipe( sass() )
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(sourcemaps.write())
    .pipe( gulp.dest( path.sass_dest ) )
    .pipe(size())
    .pipe( browserSync.reload( {
      stream: true
    } ) )
} );


// Deleting all dist content
gulp.task( 'clean', function() {
  return del.sync( path.dist );
} );


// Image optimization
gulp.task( 'min-images', function() {
  return gulp.src( path.img )
    .pipe( imagemin( {
      progressive: true,
      svgoPlugins: [ { removeViewBox: false } ]
    } ) )
    .pipe( gulp.dest( path.img_dist ) );
} );

// Sprite all the SVG inside the 'icons' folder
// into a single SVG file in 'icons/dest'
gulp.task('svgstore', function () {
    return gulp
      .src(path.svg)
      .pipe(svgmin())
      .pipe(svgstore())
      .pipe(rename({baseline: 'sprite'}))
      .pipe(gulp.dest(path.svg_dest));
} );



/////////////////
// MACRO TASKS //
/////////////////

// Watch task
gulp.task( 'watch', ['browserSync'], function(){
  gulp.watch( path.sass, ['sass'] );
  gulp.watch( path.html, browserSync.reload ); 
  gulp.watch( path.js, browserSync.reload ); 
  gulp.watch( path.img, browserSync.reload ); 
} );

// Production Sass Task : Compile SASS into CSS + Remove comments 
// + Remove unused css + Autoprefixer
// + Rename + Minify + Move to dest folder
gulp.task('sass-prod', function () {
  return gulp
    .src(path.sass)
    .pipe(sass({
      onError: console.error.bind(console, 'SASS error')
    }))
    .pipe(stripCssComments())
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(cleanCSS({debug: true}, function(details) {
        console.log(details.name + ' original size : ' + details.stats.originalSize);
        console.log(details.name + ' minified size : ' + details.stats.minifiedSize);
    }))
    .pipe(size())
    .pipe(gulp.dest(path.css_dist));
} );

// Build task
gulp.task( 'build', ['clean', 'sass-prod'], function(){
  gulp.src( path.html )
    .pipe( useref() )
    .pipe( gulpIf( '*.js', uglify() ) )
    .pipe( gulpIf( '*.css', cssnano() ) )
    .pipe( gulp.dest( path.dist ) );

  // Copy img to dist and optim
  gulp.src( path.img )
    .pipe( imagemin( {
      progressive: true,
      svgoPlugins: [ { removeViewBox: false } ]
    } ) )
    .pipe( gulp.dest( path.img_dist ) );

  // Copy SVG sprite to dist
  gulp.src( path.svg )
    .pipe( gulp.dest( path.svg_dist ) );

  // Copy css to dist
  gulp.src( path.css )
    .pipe( gulp.dest( path.css_dist ) );

  // Copy js to dist
  gulp.src( path.js )
    .pipe( gulp.dest( path.js_dist ) );
} );

gulp.task('default', ['watch'], function () {});