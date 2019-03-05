const gulp = require('gulp');
const vulcanize = require('gulp-vulcanize');
const uglify = require('gulp-uglify');
const htmlmin = require('gulp-htmlmin');
const pump = require('pump');
const dest = require('dest');
const del = require('del');
const cleanCSS = require('gulp-clean-css');

var elementsPath = 'build/elements/nextprot-elements';
var rootPath = 'build';
 
gulp.task('clean', function (cb) {
    del(['./build/**'], cb);
});

gulp.task('vulcanize', function () {
    return gulp.src('./bower_components/nextprot-elements/nextprot-elements.html')
        .pipe(vulcanize({
            strip: true,
            inlineScripts: true,
            inlineCss: true
        }))
        .pipe(gulp.dest('./build/elements/'));
});

gulp.task('copy-elements', function () {
    var elementsTask =  gulp.src('./bower_components/nextprot-elements/*.html')
                            .pipe(dest(elementsPath));
    var biovizTask = gulp.src('./bower_components/nextprot-elements/bio-viz-v2/**')
                            .pipe(dest(elementsPath + '/bio-viz-v2'));
    var  colorbarTask = gulp.src('./bower_components/nextprot-elements/colorbar/**')
                            .pipe(dest(elementsPath + '/colorbar'));
    return [elementsTask, biovizTask, colorbarTask];   
});

gulp.task('build-elements', function () {
    return gulp.src('./bower_components/nextprot-elements/external-elements.html')
        .pipe(vulcanize({
            strip: true,
            inlineScripts: true,
            inlineCss: true
        }))
        .pipe(gulp.dest('./build/elements/'));
});

gulp.task('minify-css', () => {
    return gulp.src('build/css/*.css')
      .pipe(cleanCSS())
      .pipe(gulp.dest('build/css'));
});

gulp.task('compress', ['minify-css'] , () => {
    return gulp.src('build/js/*.js')
          .pipe(uglify({ mangle: false }))
          .pipe(gulp.dest('./build/js'));
});

/**
 * bio-viz folder has to be in the root web directory, so it has to be copied
 */
gulp.task('copy-bio-viz', function() {
    return gulp.src(['./bower_components/nextprot-elements/bio-viz-v2/**'])
        .pipe(dest(rootPath + '/bio-viz-v2'));
});


gulp.task('default', ['copy-elements', 'build-elements', 'compress']);
