var http = require ('http');

http.createServer ((req, res) => {
    if (req.url == '/api/name') {
        res.writeHead (200, {'Content-Type': 'text/plain; charset=utf-8'});
        res.end('Гончар Александр Сергеевич');
    } else {
        res.writeHead (404, {'Content-Type': 'text/plain'});
        res.end('not found');
    }
    
}).listen (5001, () => {
    console.log('Server is listening on port 5001');
});  