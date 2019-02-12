var gulp = require('gulp');
var dest = require('dest');
var del = require('del');
var vulcanize = require('gulp-vulcanize');

gulp.task('clean', function (cb) {
    del(['./build/elements/**'], cb);
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

gulp.task('vulcanize-polymer-elements', function () {
    return gulp.src('./bower_components/nextprot-elements/external-elements.html')
        .pipe(vulcanize({
            strip: true,
            inlineScripts: true,
            inlineCss: true
        }))
        .pipe(gulp.dest('./build/elements/'));
});

gulp.task('default', ['clean', 'vulcanize']);
