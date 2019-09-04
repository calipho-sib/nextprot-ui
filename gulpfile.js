const gulp = require('gulp');
const vulcanize = require('gulp-vulcanize');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const replace = require('gulp-replace')
// const htmlmin = require('gulp-htmlmin');
const htmlmin = require('gulp-html-minifier');
const pump = require('pump');
const dest = require('dest');
const del = require('del');
const cleanCSS = require('gulp-clean-css');
const fs = require('fs');


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
            inlineCss: true,
            stripComments : true
        }))
        .pipe(htmlmin({
            // collapseWhitespace: true
            minifyJS:true,
            minifyCSS:true,
            removeComments: true
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
function getVendorVersion() {
    var filename = "";
    fs.readdirSync('./build/js/').forEach(file => {
        if ((/^vendor.*.js$/).test(file)){
            filename = file.split("_")[1].split(".")[0];
        }
      });
    return filename;
}
gulp.task('build-elements', function () {
    var extElemFileName = getVendorVersion();
     return gulp.src('./bower_components/nextprot-elements/external-elements.html')
        .pipe(vulcanize({
            stripExcludes: ['./bower_components/font-roboto/roboto.html'],
            strip: true,
            inlineScripts: true,
            inlineCss: true
        }))
        .pipe(htmlmin({
            collapseWhitespace: true,
            minifyJS:true,
            minifyCSS:true,
            removeComments: true
        }))
        .pipe(rename('external-elements_'+extElemFileName+'.html'))
        .pipe(gulp.dest('./build/elements/'));

    // var indexReplaceTask = gulp.src(['build/index.html'])
    //       .pipe(replace('extElemVersion', extElemFileName))
    //       .pipe(gulp.dest('build/'));
    // return [buildExtElem, indexReplaceTask]
});

gulp.task('copy-vendor', () => {
    return gulp.src('build/css/vendor_*.css')
        .pipe(rename("vendor_sparql.css"))
        .pipe(gulp.dest('./build/css/'));
});

gulp.task('build-app', ['build-elements','copy-vendor']);

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


gulp.task('default', ['copy-elements', 'build-app', 'compress']);
