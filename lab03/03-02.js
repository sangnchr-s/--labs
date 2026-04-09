const http = require('http');
const url  = require('url'); 

function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true); // /fact?k=3.   pathname: '/fact', query: 'k=3'
    if (parsedUrl.pathname == '/fact') { 
        const k = parseInt(parsedUrl.query.k);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ k, fact }));
    } else {
        res.writeHead(404, { 'Content-Type': 'plain/text'});
        res.end('Not Found');
    }
}).listen(5000, () => {
    console.log('Server running at http://localhost:5000');
});
