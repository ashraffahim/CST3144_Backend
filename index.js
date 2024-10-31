const http = require('http');

const server = http.createServer((request, response) => {
    console.log('In come a request to: ' + request.url);
    response.setHeader('Content-Type', 'application/json');
    response.end(
        JSON.stringify([
            { topic:'Math', location: 'London', price: 100.00 },
            { topic:'Math', location: 'Liverpool', price: 80.00 },
            { topic:'Math', location: 'Oxford', price: 90.00 },
            { topic:'Math', location: 'Bristol', price: 120.00 },
        ])
    );
});

server.listen(3000);