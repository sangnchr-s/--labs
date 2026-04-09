const fs = require('fs');
const path = require('path');

const static_files = {
    'html': 'text/html',
    'css': 'text/css',
    'js': 'text/javascript',
    'png': 'image/png',
    'docx': 'application/msword',
    'json': 'application/json',
    'xml': 'application/xml',
    'mp4': 'video/mp4'
};

module.exports = function createStaticHandler(rootDir = 'static') {
    return function (req, res) {
        if (req.method !== 'GET') {
            res.writeHead(405);
            res.end('Method Not Allowed');
            return;
        }

        const filePath = path.join(rootDir, req.url.split('?')[0]);
        const ext = path.extname(filePath).slice(1).toLowerCase();

        if (!static_files[ext]) {
            res.writeHead(404);
            res.end('Not Found');
            return;
        }

        fs.readFile(filePath, function (err, data) {
            if (err) {
                res.writeHead(404);
                res.end('Not Found');
                return;
            }
            res.writeHead(200, { 'Content-Type': static_files[ext] });
            res.end(data);
        });
    };
};
