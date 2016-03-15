var gulp = require('gulp');
var stylus = require('gulp-stylus');
var autoprefixer = require('gulp-autoprefixer');

gulp.task('css', function() {
    gulp.src(['./public/style.styl'])
        .pipe(stylus({
            compress: true
        }))
        .pipe(autoprefixer({
            browsers: ['last 10 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('./public/'));
});

gulp.task('watch', function() {
    gulp.watch('public/**/*.styl', ['css']);
    gulp.start('css');
});

gulp.task('build', function() {
    gulp.start('css');
});
