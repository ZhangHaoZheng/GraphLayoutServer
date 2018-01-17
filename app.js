var express = require('express');
var bodyParser = require('body-parser');
var multiScaleLayout = require('./multiScaleLayoutV3');
var app = express();


app.use(bodyParser.json({ limit: '1mb' })); //body-parser 解析json格式数据
app.use(bodyParser.urlencoded({ //此项必须在 bodyParser.json 下面,为参数编码
    extended: true
}));

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept, X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

app.post('/multi-scale', function(req, res) {

    var theReqJsonObj = req.body;
    var layout = new multiScaleLayout();
    var startTime = new Date().getTime();
    var ansObj = layout.start(theReqJsonObj, parseInt(req.param('w')), parseInt(req.param('h')));
    var endTime = new Date().getTime();
    console.log('interval: ' + (endTime - startTime) / 1000);
    res.send(ansObj);
});

app.listen(3000, function() {
    console.log('----------app now is listening----------');
});
