const http = require('http');
const createStaticHandler = require('./m07-01.js');

const handler = createStaticHandler('static');
const server = http.createServer(handler);

server.listen(5001, () => {
  console.log('Listening on: http://localhost:5001');
});
