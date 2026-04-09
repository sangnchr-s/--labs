var http = require('http');
var fs = require('fs');

http.createServer((req, res) => {
    if (req.url === '/html') {
        fs.readFile('index.html', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('error loading');
                return;
            } 
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(data);
        }
    )
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
}
).listen(5001, () => {
    console.log('Server is listening on port 5001')
})
