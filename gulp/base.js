'use strict';

var gulp = require('gulp');
var path = require('path');
var config = require('./config');
var _ = require('lodash');
var wiredep = require('wiredep').stream;
var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'event-stream', 'main-bower-files', 'uglify-save-license', 'del', 'imagemin-pngquant']
});
var browserSync = require('browser-sync');


/*****************代码检查 start*********************************************/
gulp.task('scripts',function () {
	return gulp.src([
        path.join(config.paths.static, 'js/**/*.js'),
        ])
	.pipe($.jshint())
	.pipe($.jshint.reporter('jshint-stylish'))
	//js文件改变时无刷新加载
	.pipe(browserSync.reload({ stream: true }))
	.pipe($.size());
});
/*****************代码检查 end*********************************************/

/*****************clean start*********************************************/
gulp.task('clean', function () {
  $.del([path.join(config.paths.static, '*.html')]);
});
/*****************clean end*********************************************/

/************编译jade******************/
gulp.task('jade', function(){
    gulp.src([
        path.join(config.paths.static, 'jade/**/*.jade')
    ])
    .pipe($.plumber(config.errorHandler()))
    .pipe($.jade({
      pretty: true
    }))
    .pipe(gulp.dest(config.paths.static));
});
/************ jade end **********************/

/******编译之前将scss注入index.scss  start ************/
gulp.task('inject_sass',function () {
	//1,将所有scss文件注入到index.scss
	var injectFiles = gulp.src([
			path.join(config.paths.static, 'scss/*.scss'),
			path.join('!'+ config.paths.static, 'scss/index.scss')
		],{read:false});
	/**
	 * 参考API:https://github.com/klei/gulp-inject#optionsstarttag
	 */
	var injectOptions = {
	  transform: function(filePath) {
	    filePath = filePath.replace(config.paths.static + '/scss/', '');
	    return '@import "' + filePath + '";';
	  },
	  starttag: '// injector',
	  endtag: '// endinjector',
	  addRootSlash: false
	};
	return gulp.src(path.join(config.paths.static, 'scss/index.scss'))
					.pipe($.inject(injectFiles, injectOptions))
					.pipe(wiredep(_.assign({}, config.wiredep)))
					.pipe(gulp.dest(path.join(config.paths.static, 'scss/')));
});
/******编译之前将scss注入index.scss   end ************/

/*****************CSS(SASS编译) start*********************************************/
gulp.task('styles:sass',['inject_sass'], function () {

	return gulp.src(path.join(config.paths.static, 'scss/index.scss'))
		.pipe($.plumber(config.errorHandler()))
		.pipe($.sourcemaps.init())
		.pipe($.sass({outputStyle: 'expanded'}))
		.pipe($.autoprefixer())
		.pipe($.sourcemaps.write())
		.pipe(gulp.dest(path.join(config.paths.static, 'css/')))
		//css改变时无刷新改变页面
		.pipe(browserSync.reload({ stream: true }));
});
/*****************CSS(SASS编译) end*********************************************/

/*****************CSS(COMPASS编译) start*********************************************/
gulp.task('styles:compass',['inject_sass'],function () {
	return gulp.src(path.join(config.paths.static, 'scss/index.scss'))
		.pipe($.plumber(config.errorHandler()))
		.pipe($.compass({
            config_file: path.join(__dirname, '/../config.rb'),
            css: path.join(config.paths.static, 'css/'),
            sass: path.join(config.paths.static, 'scss/'),
            //其余项都在config.rb中配置
		}))
		.pipe(gulp.dest(path.join(config.paths.static, 'css/')))
		//css改变时无刷新改变页面
		.pipe(browserSync.reload({ stream: true }));
});
/*****************CSS(COMPASS编译) end*********************************************/

/*****************inject(css,js注入index.html) start***************************/
gulp.task('inject', ['jade', 'scripts', 'styles:compass'], function () {
  var injectStyles = gulp.src([
    path.join(config.paths.static, 'css/*.css')
  ], { read: false });

  var injectScripts = gulp.src([
    path.join(config.paths.static, 'js/**/*.js'),
  ]);
	return gulp.src(path.join(config.paths.static, '/*.html'))
		.pipe($.plumber(config.errorHandler()))
		.pipe($.inject($.eventStream.merge(
		  injectStyles,
		  injectScripts
		)))
		.pipe(wiredep(_.extend({}, config.wiredep)))
        .pipe(gulp.dest(config.paths.static));
});
/*****************inject(css,js注入index.html) end***************************/
