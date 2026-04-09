var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');

var DB = require('../task01/db').DB;

var db = new DB();

var htmlPath = path.join(__dirname, '04-02.html');

http.createServer((req, res) => {

    var parsedUrl = url.parse(req.url, true);

    var pathname = parsedUrl.pathname;

    var query = parsedUrl.query;

    if (req.method === 'GET' && (pathname === '/' || pathname === '/index.html')) {
        fs.readFile(htmlPath, function (_, data) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
        return;
    }

    if (req.method === 'GET') {
        db.select((_, rows) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(rows));
        });
        return;
    }

    if (req.method === 'POST') {
        var body = '';

        req.on('data', function (chunk) { body += chunk; });

        req.on('end', function () {
            var row;
            if (body) {
                row = JSON.parse(body);
            } else {
                row = null;
            }
            db.insert(row, function (_, inserted) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(inserted));
            });
        });
        return;
    }

    if (req.method === 'PUT') {
        var bodyPut = '';
        req.on('data', function (chunk) { bodyPut += chunk; });
        req.on('end', function () {
            var row;
            if (bodyPut) {
                row = JSON.parse(bodyPut);
            } else {
                row = null;
            }
            db.update(row, function (_, updated) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(updated));
            });
        });
        return;
    }

    if (req.method === 'DELETE') {
        var id = query.id;
        db.delete(id, function (_, deleted) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(deleted));
        });
        return;
    }

    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'ne tot method' }));

}).listen(5001, function () {
    console.log('04-02: http://localhost:' + 5001 + '/');
});
