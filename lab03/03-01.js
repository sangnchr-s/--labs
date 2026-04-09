const http = require('http');

let state = 'norm';
const validStates = ['norm', 'stop', 'test', 'idle']; 


http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<h1>${state}</h1>`);
}).listen(5001, () => {
    console.log('Server running at http://localhost:5001');
    process.stdout.write(`[${state}] > `);
});

process.stdin.setEncoding('utf-8');
process.stdin.on('readable', () => { 
    let chunk = null;

    while ((chunk = process.stdin.read()) != null) {
        const command = chunk.trim() // "test"

        if (command == 'exit') process.exit(0);
        else if (validStates.includes(command)) state = chunk.trim(); 
        else process.stdout.write(command + '\n');
        process.stdout.write(`[${state}] > `); 
    }
});
