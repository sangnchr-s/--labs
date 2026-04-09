const http = require('http');
const url  = require('url');

function factorial(n, callback) {
    if (n <= 1) {
        callback(1);
        return;
    }
    process.nextTick(() => {
        factorial(n - 1, (result) => {
            callback(n * result); 
        });
    });
}

const page = /* html */`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>03-04</title>
</head>
<body>
    <div id="output"></div>
    <script>
        const start  = Date.now();
        const output = document.getElementById('output');
        let i = 0, completed = 0;
        const total = 21;

        for (let k = 0; k <= 20; k++) {
            fetch('/fact?k=' + k)
                .then(res => res.json())
                .then(data => {
                    const t = Date.now() - start;
                    output.innerHTML += (i++) + '.Результат: ' + t + '-' + data.k + '/' + data.fact + '<br>';
                    completed++;
                    if (completed === total) {
                        const duration = Date.now() - start;
                        output.innerHTML += '<p>Общая продолжительность: ' + duration + ' мс</p>';
                    }
                });
        }
    </script>
</body>
</html>`;

http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    if (parsedUrl.pathname == '/fact') {
        const k = parseInt(parsedUrl.query.k);
        factorial(k, (fact) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ k, fact }));
        });
    } else if (parsedUrl.pathname == '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(page);
    } else {
        res.writeHead(404, { 'Content-Type': 'plain/text' });
        res.end('Not Found');
    }
}).listen(5001, () => {
    console.log('Server running at http://localhost:5001');
});
