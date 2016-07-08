'use strict';

var gulp = require('gulp');
var config = require('./config');
var path = require('path');
var browserSync = require('browser-sync');
var proxyMiddleware = require('http-proxy-middleware');
var browserSyncSpa = require('browser-sync-spa');
var nodemon = require('gulp-nodemon');
var gulpSequence = require('gulp-sequence');



//开始之前先将必要文件注入
gulp.task('watch', function () {

	gulpSequence('inject', function() {

		//监控bower.json文件
		gulp.watch(['bower.json'],['inject']);
		//监控CSS文件
		gulp.watch([
			path.join(config.paths.public, '/scss/**/*.scss')
		],
			function (event) {
				gulp.start('inject');
		});
		//监控JS文件
		gulp.watch([path.join(config.paths.public, '/js/**/*.js')],function (event) {
			if(event.type === 'changed'){
				gulp.start('scripts');
			}else{
				gulp.start('inject');
			}
		});
		//监控jade文件
		gulp.watch([
				path.join(config.paths.views, '/*.jade')
			],function (event) {
				browserSync.reload(event.path);
			});
	});
});

gulp.task('nodemon',function () {
	nodemon({
	  script: 'app.js',
	  ext: 'js json',
	env: { 'NODE_ENV': 'development' }
  });
});

function browserSyncInit () {
	//起动browserSync
	browserSync.init({
	  	proxy: "0.0.0.0:8000"
		});
}
gulp.task('serve',function () {
	gulpSequence('nodemon',['watch'],function () {
		browserSyncInit();
	});
});
