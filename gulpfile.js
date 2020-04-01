const { series, src, dest, watch, parallel } = require('gulp');
var less        = require('gulp-less');
var uglify      = require('gulp-uglify');
var rename      = require('gulp-rename');
var concat      = require('gulp-concat');  //合并文件
var changedInPlace = require('gulp-changed-in-place');//不管修改哪个文件，gulp会简化DEST里的html文件
var minifyHTML  = require('gulp-htmlmin');  //简化html
var browserSync = require('browser-sync').create(); //自动刷新
var babel       = require('gulp-babel'); //支持es6
var gulpClean       = require('gulp-clean');  //监听
var LessAutoprefix = require('less-plugin-autoprefix');
var minifyCSS = require('gulp-csso');
var gutil       = require('gulp-util');  //log

var autoprefix = new LessAutoprefix({ browsers: ['last 6 versions', '> 1%', 'ie 9'] });

/**
 * 打包 less 文件
 */
function minifyless () {
    return src('src/style/style.less', {allowEmpty: true})
        .pipe(less({
            plugins: [autoprefix],
        }))
        .pipe(minifyCSS())
        .pipe(rename('style.min.css'))
        .pipe(dest('dist/css'))
        .pipe(browserSync.stream());
}

/***
 * 压缩 js 文件
 */
function minifyjs(){
    return src('src/js/index.js')
    .pipe(babel())
    .pipe(uglify())
    .on('error', function(err) {
        gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(concat('index.min.js'))
    .pipe(dest('dist/js'))
    .pipe(browserSync.stream());
}
    

/***
 * 拷贝 font
 */
function copyFont(){
    return  src('src/font/**')
    .pipe(dest('dist/font'))
    .pipe(browserSync.stream());
}
/***
 * 拷贝 image
 */
function copyImage(){
    return src('src/image/**')
        .pipe(dest('dist/image'))
        .pipe(browserSync.stream());
}

function minifyHtml(){
    return src('src/*.html')
        .pipe(changedInPlace({firstPass: true}))
        .pipe(minifyHTML({collapseWhitespace: true}))
        .pipe(dest('dist'))
        .pipe(browserSync.stream());
}

function clean() {
    return src('dist', {read: false, allowEmpty:true})
        .pipe(gulpClean());
}

var files = [
    './dist/css/*.css',
    './dist/js/*.js'
];

function browserSyncTask(){
    return browserSync.init(files,{
        server: {
            baseDir: './dist'
        },
        port: 9999
    });
}

function watchTask() {
    watch('src/style/*.less',minifyless)
    watch('src/js/index.js',minifyjs)
    watch('src/index.html',minifyHtml)
    watch('src/font/**',copyFont)
    watch('src/image/**',copyImage)
}

/**
 * default 任务
 */
//develop

// exports.build = build;
exports.default = series(
    clean, 
    parallel(
        copyImage,
        copyFont,
        minifyjs,
        minifyless,
        minifyHtml,
        watchTask,
        browserSyncTask
    )
);