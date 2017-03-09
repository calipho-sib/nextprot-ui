var gulp = require('gulp');
var dest = require('dest');
var del = require('del');
var vulcanize = require('gulp-vulcanize');

gulp.task('mkdir', function(db){
    dest('./build/elements')
});

gulp.task('clean', function(cb) {
    del(['./build/elements/**'], cb);
});

gulp.task('vulcanize', function() {
    return gulp.src('bower_components/nextprot-elements/function-view.html')
        .pipe(vulcanize({
            stripComments: true,
            inlineScripts: true,
            inlineCss: true
        }))
        .pipe(gulp.dest('build/elements/'));
});

gulp.task('default', ['mkdir', 'clean', 'vulcanize']);