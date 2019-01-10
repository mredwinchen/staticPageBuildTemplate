'use strict';

var fs = require('fs')
var path = require('path')
var gulp = require('gulp')
var gutil = require('gulp-util')
var data = require('gulp-data')
var browserSync = require('browser-sync')
var ejs = require('gulp-ejs')
var sass = require('gulp-sass')
var runSequence = require('run-sequence')
var autoprefixer = require('gulp-autoprefixer')
var sourcemaps = require('gulp-sourcemaps')

var tplDir = './templates'  // 模版目录
var distDir = './html'      // 生成目录

//sass编译css
gulp.task('sass', function () {
    return gulp.src('scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            // outputStyle: 'compressed'
            // * nested：嵌套缩进的css代码，它是默认值。
            // * expanded：没有缩进的、扩展的css代码。
            // * compact：简洁格式的css代码。
            // * compressed：压缩后的css代码。
            outputStyle: 'expanded'
        }))
        .pipe(autoprefixer({}))
        .pipe(gulp.dest(distDir+'/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// 模版合并
gulp.task('ejs', function(){
    gulp.src(tplDir + '/**/*.html')
        .pipe(data(function (file) {

            var filePath = file.path;

            // global.json 全局数据，页面中直接通过属性名调用
            return Object.assign(JSON.parse(fs.readFileSync(tplDir + '/global.json')), {
                // local: 每个页面对应的数据，页面中通过 local.属性 调用
                local: JSON.parse(fs.readFileSync( path.join(path.dirname(filePath), path.basename(filePath, '.html') + '.json')))
            }) 
        }))
        .pipe(ejs().on('error', function(err) {
            gutil.log(err);
            this.emit('end');
        }))
        .pipe(gulp.dest(distDir));
});

gulp.task('ejs-watch', ['ejs'], browserSync.reload);

//构建服务器
gulp.task('browserSync', function () {
    browserSync({
        server: {
            baseDir: distDir
        },
        reloadDebounce: 0
    })
});

//监听文件变化
gulp.task('watch', ['browserSync', 'sass', 'ejs'], function () {
    gulp.watch('scss/**/*.scss', ['sass']);
    gulp.watch('js/**/*.js', browserSync.reload);
    // 无论是数据文件更改还是模版更改都会触发页面自动重载
    gulp.watch(tplDir + '/**/*.*', ['ejs-watch']);
});

// 开发模式　
gulp.task('dev', function (callback) {
    runSequence(['sass', 'watch','ejs'],
        callback
    )
});