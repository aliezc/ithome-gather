# pengfu-gather

百思不得姐笑话采集脚本，采用node.js编写

## 依赖

> requrl

## 用法

先安装依赖

```shell
npm install
```

编写一个文件

```javascript
var budejie = require('budejie-gather');

budejie(1,			// 起始页码
		3,			// 结束页码
function(res){		// 回调函数
	for(var i = 0 ; i < res.length; i++){
		// 结果是一个数组
		console.log(res[i]);
	}
});
```

## MIT License