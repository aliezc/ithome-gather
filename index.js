'use strict';

/* IT之家采集工具 */

var request = require('requrl');
var assert = require('assert');
var iconv = require('iconv-lite');

/*
 * 获取文档内容
 * @param {string} 地址
 * @param {function} 回调函数
 */
var getContent = function(url, cb){
	request({
		url: url,
		headers: {
			"referer": 'http:///www.ithome.com/',
			"user-agent": 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.84'
		},
		error: function(err){
			console.log('获取' + url + '失败');
			if('function' == typeof cb) cb.call(null, err);
		},
		success: function(data){
			// 转换字符编码为utf8
			var content = iconv.decode(data, 'gb2312');
			
			// 优化格式
			content = content.replace(/\n|\r/gm, '');
			
			// 文章内容
			var body = content.match(/<div class\=\"post\_content\" id\=\"paragraph\">(.*?)<\/div>/m)[1];
			body = body.replace('<script src="http://img.ithome.com/file/js/v2/content_set.js"></script>', '').trim();
			
			// 标题
			var title = content.match(/<h1>(.*?)<\/h1>/)[1];
			
			// 时间
			var time = content.match(/<span id\=\"pubtime\_baidu\">(.*?)<\/span>/m)[1];
			var timestamp = new Date(time).getTime();
			
			// 结果对象
			var result = {
				title: title,
				time: timestamp,
				body: body
			}
			if('function' == typeof cb) cb.call(null, null, result);
		}
	});
}

/*
 * 采集主函数
 * @param {number} 开始页码
 * @param {number} 结束页码
 * @param {function} 完成后的回调函数，参数为数组
 */
module.exports = function(pagefrom, pageto, cb){
	assert(typeof pagefrom == 'number', 'Invalid pagefrom type');
	assert(typeof pageto == 'number', 'Invalid pageto type');
	assert(typeof cb == 'function', 'Invalid callback type');
	
	// 整理页码
	var from = pagefrom <= pageto ? pagefrom : pageto;
	var to = pageto >= pagefrom ? pageto : pagefrom;
	
	// 保存结果的数组
	var result = [];
	
	// 文章总数
	var article_count = 0;
	
	//  已完成的页数
	var finished = 0;
	
	// 开始采集
	for(var i = from; i <= to; i++){
		var page = i;
		request({
			url: 'http://www.ithome.com/list/list_' + i + '.html',
			headers: {
				"referer": 'http:///www.ithome.com/',
				"user-agent": 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.84'
			},
			success: function(data){
				var matches = data.toString().replace(/\n|\r/gm, '').match(/http\:\/\/www\.ithome\.com\/html\/.*?\.htm/gm);
				article_count += matches.length;
				for(var j = 0 ; j < matches.length; j++){
					getContent(matches[j], function(err, r){
						if(err == null){
							result.push(r);
						}
						finished++;
						if(finished == article_count) cb.call(null, result);
					});
				}
			},
			error: function(err){
				console.log('获取第' + page + '页失败');
				finished++;
				if(finished == article_count) cb.call(null, result);
			}
		});
	}
}