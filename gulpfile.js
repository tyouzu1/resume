var gulp        = require('gulp');
var sass        = require('gulp-sass');
var prefix      = require('gulp-autoprefixer');
var uglify      = require('gulp-uglify');
var rename      = require('gulp-rename');
var concat      = require('gulp-concat');  //合并文件
var changedInPlace = require('gulp-changed-in-place');//不管修改哪个文件，gulp会简化DEST里的html文件
var minifyHTML  = require('gulp-htmlmin');  //简化html
var browserSync = require('browser-sync').create(); //自动刷新
var babel       = require('gulp-babel'); //支持es6
var sequence    = require('gulp-sequence'); //按照顺序执行
var clean       = require('gulp-clean');  //监听

/**
 * 打包 scss 文件
 */
gulp.task('minifysass',function(){
        gulp.src('src/style/style.scss')
        .pipe(sass({
            includePaths:['scss'],
            onError:function(e){
                console.log(e)
            },
            outputStyle: 'compressed' // 压缩
        }))
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'],{cascade: true}))
        .pipe(rename('style.min.css'))
        .pipe(gulp.dest('css'))
        .pipe(browserSync.stream());
})

/***
 * 压缩 js 文件
 */
gulp.task('minifyjs',function(){
    gulp.src('src/js/index.js')
        .pipe(babel())
        .pipe(uglify())
        .pipe(concat('index.min.js'))
        .pipe(gulp.dest('js'))
        .pipe(browserSync.stream());
})

/***
 * 拷贝 font
 */
gulp.task('font',function(){
    gulp.src('src/font/**')
        .pipe(gulp.dest('font'))
        .pipe(browserSync.stream());
})
/***
 * 拷贝 image
 */
gulp.task('image',function(){
    gulp.src('src/image/**')
        .pipe(gulp.dest('image'))
        .pipe(browserSync.stream());
})

gulp.task('minify-html', function(){
    gulp.src('src/*.html')
        .pipe(changedInPlace({firstPass: true}))
        .pipe(minifyHTML({collapseWhitespace: true}))
        .pipe(gulp.dest(''))
        .pipe(browserSync.stream());
});

gulp.task('clean', function () {
    gulp.src(['./css/*.css','./js/*.js'], {read: false})
        .pipe(clean());
});

var files = [
    './css/*.css',
    './js/*.js'
];

gulp.task('browser-sync', function(){
    browserSync.init(files,{
        server: {
            baseDir: './'
        },
        port: 9999
    });
});

gulp.task('watch',function(){
    gulp.watch('src/style/*.scss',['minifysass'])
    gulp.watch('src/js/index.js',['minifyjs'])
    gulp.watch('src/index.html',['minify-html'])
    gulp.watch('src/font/**',['font'])
    gulp.watch('src/image/**',['image'])

})



/**
 * default 任务
 */

//develop
gulp.task('default', sequence('clean','minifyjs', 'minifysass','minify-html', 'watch','browser-sync'));