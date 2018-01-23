var express = require('express');
var bodyParser = require('body-parser');
var multiScaleLayout = require('./multiScaleLayoutV4');
var mysql = require('mysql');
var settings = require('./settings');

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

app.get('/getHandledData', function(req, res) {
    console.log('/getHandledData');
    var connection = mysql.createConnection(settings.db);
    connection.connect();
    var selectSQL = 'select send_node_global_id,receive_node_global_id from transitnet0515s limit 10000';
    var nodeArray = [];
    var id2node = [];
    connection.query(selectSQL, function(err, rows) {
        if (err) throw err;
        for (var i = 0; i < rows.length; i++) {
            var sourceId = rows[i].send_node_global_id;
            var targetId = rows[i].receive_node_global_id;
            if(!id2node[sourceId]) {
                var node = {};
                node.id = sourceId;
                node.links = [];
                node.mark = [];
                if(sourceId != targetId) {
                    node.links.push(targetId);
                    node.mark[targetId] = true;
                }
                id2node[sourceId] = node;
                nodeArray.push(node);
            }
            else {
                var node = id2node[sourceId];
                if(sourceId != targetId && !node.mark[targetId]) {
                    node.links.push(targetId);
                    node.mark[targetId] = true;
                }
            }
            if(!id2node[targetId]) {
                var node = {};
                node.id = targetId;
                node.links = [];
                node.mark = [];
                if(targetId != sourceId) {
                    node.links.push(sourceId);
                    node.mark[sourceId] = true;
                }
                id2node[targetId] = node;
                nodeArray.push(node);
            }
            else {
                var node = id2node[targetId];
                if(targetId != sourceId && !node.mark[sourceId]) {
                    node.links.push(sourceId);
                    node.mark[sourceId] = true;
                }
            }
        }
        var layout = new multiScaleLayout();
        var startTime = new Date().getTime();
        var ansObj = layout.start(nodeArray, parseInt(req.param('w')), parseInt(req.param('h')));
        var endTime = new Date().getTime();
        console.log('interval: ' + (endTime - startTime) / 1000);
        res.send(nodeArray);
    });
    connection.end();
})

app.listen(3005, function() {
    console.log('----------app now is listening----------3005');
});
