var gulp = require( 'gulp' );
var sass = require( 'gulp-sass' );
var browserSync = require( 'browser-sync').create();
var useref = require( 'gulp-useref' );
var uglify = require( 'gulp-uglify' );
var gulpIf = require( 'gulp-if' );
var cssnano = require( 'gulp-cssnano' );
var del = require( 'del' );
var imagemin = require('gulp-imagemin');


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


// Compiling SASS task
gulp.task( 'sass', function(){
  return gulp.src( 'app/scss/**/*.scss' ) // Gets all files ending with .scss in app/scss and children dirs
    .pipe( sass() )
    .pipe( gulp.dest( 'app/css' ) )
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


/////////////////
// MACRO TASKS //
/////////////////


// Watch task
gulp.task( 'watch', ['browserSync'], function(){
  gulp.watch( 'app/scss/**/*.scss', ['sass'] ); 
  gulp.watch( 'app/*.html', browserSync.reload ); 
  gulp.watch( 'app/js/**/*.js', browserSync.reload ); 
} );


// Build task
gulp.task( 'build', ['clean', 'sass'], function(){
  gulp.src( 'app/*.html' )
    .pipe( useref() )
    .pipe( gulpIf( '*.js', uglify() ) )
    .pipe( gulpIf( '*.css', cssnano() ) )
    .pipe( gulp.dest( 'dist' ) );

  // Copy img to dist and optim
  gulp.src( 'app/img/**/*' )
    .pipe( imagemin( {
      progressive: true,
      svgoPlugins: [ { removeViewBox: false } ]
    } ) )
    .pipe( gulp.dest( 'dist/img/' ) );

  // Copy css to dist
  gulp.src( 'app/css/**/*' )
    .pipe( gulp.dest( 'dist/css/' ) );

  // Copy js to dist
  gulp.src( 'app/js/**/*' )
    .pipe( gulp.dest( 'dist/js/' ) );
} );