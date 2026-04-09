var http = require('http');
var fs = require('fs');

http.createServer((req, res) => {
    if (req.url == '/png') {
        fs.readFile('pic.png', (_, data) => {
            res.writeHead(200, { 'Content-Type': 'image/png' });
            res.end(data);
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }

}).listen(5001, () => {
    console.log('Server is listening on port 5001');
});