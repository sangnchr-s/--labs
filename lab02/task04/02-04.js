var http = require('http');
var fs = require('fs');

http.createServer((req, res) => {
    if (req.url === '/xmlhttprequest') {
        fs.readFile('xmlhttprequest.html', (_, data) => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
            console.log('callback /xmlhttprequest');
        });

    } else if (req.url === '/api/name') {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Гончар Александр Сергеевич');
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('not Found');
    }


}).listen(5001, () => {
    console.log('Server is listening on port 5001');
});