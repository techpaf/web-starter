# tsbits-starter
### A simple starter for small web projects

Hello there, here is a tiny starter I've build to answer my own needs.

#### What's inside the box ?
* [HTML5Boilerplate](https://html5boilerplate.com/)
* [Gulp](http://gulpjs.com/)
* [SaSS](http://sass-lang.com/)

### Documentation (sort of...)
#### Setup :
* Clone that repo on your computer
* In a shell cd to where you cloned the git
* Run npm install
* Run gulp (by default this executes the 'watch' task)
* You're ready to code

#### Start coding :
* You have to work inside app/ (all your src must be inside)
* Your HTML must be written inside app/index.html
* Your CSS must be written inside app/scss/style.scss
* Your JS must be written inside app/js/main.js
* Your images must be placed inside app/img/
* Your SVG files must be placed inside app/icons/

#### Gulp is in charge of :
* Running a web server / livereload
* Compiling Sass stuff
* Minify & uglify CSS / JS files
* Optimize images
* Generate SVG icons into a SVG Sprite
* Generate the Sass documentation
* Create the release package

#### Gulp tasks :
* gulp watch
  * Start the web server
  * Open page in browser
  * Handle livereload
  * Watch files
  * Compile SaSS...
* gulp build
  * Clean the dist/
  * Compile SaSS
  * Take all link tags inside <!--build:css css/styles.min.css--> html file and build a file single file
  * Take all script tags inside <!--build:js js/main.min.js --> html file and build a file single file
  * Copy HTML / CSS / JS files inside dist
  * Optimize image from app/img/, then copy to dist/img
  * Sprite all the SVG files and optimize them in app/icons in app/icons/dest/ and then copy to dist/icons

#### Under the hood :
* The watch task will watch change on .html .scss and .js files
* Never edit your CSS in app/css/style.css, file is erased each to SaSS is compiled
* app/css/main.css & app/css/normalize.css are CSS from [HTML5Boilerplate](https://html5boilerplate.com/)
* app/js/plugins.js & app/js/vendors/modernizr-$.min.js are JS from [HTML5Boilerplate](https://html5boilerplate.com/)

#### Credits :
* [HTML5Boilerplate](https://html5boilerplate.com/) because it's my favorite boilerplate
* [Node](https://nodejs.org/en/) because that's my favorite tool ATM
* [Gulp](http://gulpjs.com/) because it's faster than Grunt and Gulp sound better than Grunt
* [SaSS](http://sass-lang.com/) because it saved me a lot of time
* [CSSTricks](https://css-tricks.com/) for some cool articles on Gulp and more generaly this website rocks
