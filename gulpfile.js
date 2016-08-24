var gulp             = require( 'gulp' );
var sass             = require( 'gulp-sass' );
var sassdoc          = require( 'sassdoc' );
var plumber          = require( 'gulp-plumber' );
var gutil            = require( 'gulp-util' );
var sourcemaps       = require( 'gulp-sourcemaps' );
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


///////////////////
// CONFIGURATION //
///////////////////
var path = {
  sass: './app/scss/**/*.scss',
  js: './app/js/**/*.js',
  img: './app/img/*',
  html: './app/*.html',
  dist: './dist',
  js_dist: './dist/js'
};

var autoprefixerOptions = {
  browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1']
};

var gulp_src = gulp.src;
gulp.src = function() {
  return gulp_src.apply(gulp, arguments)
    .pipe(plumber(function(error) {
      // Output an error message
      gutil.log(gutil.colors.red('Error (' + error.plugin + '): ' + error.message));
      // emit the end event, to properly end the task
      this.emit('end');
    })
  );
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
    .pipe(sass({
      onError: console.error.bind(console, 'SASS error')
    }))
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(sourcemaps.write())
    .pipe( gulp.dest( 'app/css' ) )
    .pipe(size())
    .pipe( browserSync.reload( {
      stream: true
    } ) )
} );


// Deleting all dist content
gulp.task( 'clean', function() {
  return del.sync( 'dist' );
} );


// Image optimization
gulp.task( 'min-images', function() {
  return gulp.src( 'app/img/*' )
    .pipe( imagemin( {
      progressive: true,
      svgoPlugins: [ { removeViewBox: false } ]
    } ) )
    .pipe( gulp.dest( 'dist/img' ) );
} );

// Sprite all the SVG inside the 'icons' folder
// into a single SVG file in 'icons/dest'
gulp.task('svgstore', function () {
    return gulp
      .src('app/icons/*.svg')
      .pipe(svgmin())
      .pipe(svgstore())
      .pipe(rename({baseline: 'sprite'}))
      .pipe(gulp.dest('app/icons/dest'));
} );

/////////////////
// MACRO TASKS //
/////////////////

// Watch task
gulp.task( 'watch', ['browserSync'], function(){
  gulp.watch( path.sass, ['sass'] ); 
  gulp.watch( path.html, browserSync.reload ); 
  gulp.watch( path.js, browserSync.reload ); 
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
    .pipe(gulp.dest(path.dist + '/css'));
} );

// Build task
gulp.task( 'build', ['clean', 'sass-prod'], function(){
  gulp.src( 'app/index.html' )
    .pipe( useref() )
    .pipe( gulpIf( '*.js', uglify() ) )
    .pipe( gulp.dest( 'dist' ) );

  // Copy img to dist and optim
  gulp.src( 'app/img/**/*' )
    .pipe( imagemin( {
      progressive: true,
      svgoPlugins: [ { removeViewBox: false } ]
    } ) )
    .pipe( gulp.dest( 'dist/img/' ) );

  // Copy PHP files to dist
  gulp.src( 'app/*.php' )
    .pipe( gulp.dest( 'dist' ) );

  // Copy fonts files to dist
  gulp.src( 'app/fonts/*.{ttf,woff,eof,svg,otf}' )
    .pipe(gulp.dest( 'dist/fonts' ));

  // Copy SVG icons to dist
  gulp.src( 'app/icons/*.svg' )
    .pipe( gulp.dest( 'dist/icons/' ) );
    
  // Copy SVG sprite & PNG fallbacks to dist
  gulp.src( 'app/icons/dest/*.{svg,png}' )
    .pipe( gulp.dest( 'dist/icons/dest/' ) );

  // Copy css to dist
  gulp.src( 'app/css/**/*' )
    .pipe( gulp.dest( 'dist/css/' ) );

  // Copy js to dist
  gulp.src( 'app/js/**/*' )
    .pipe( gulp.dest( 'dist/js/' ) );
} );

gulp.task('default', ['watch'], function () {});