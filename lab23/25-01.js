const JsonRPCServer = require('jsonrpc-server-http-nats');

const server = new JsonRPCServer();

const checkNumbers = (param) => {
    for (const value of param) {
        if (typeof value !== 'number') {
            throw new Error('Ожидается число');
        }
    }
};

const bin_validator = (param) => {
    if (!Array.isArray(param)) {
        throw new Error('Ожидается массив');
    }
    if (param.length !== 2) {
        throw new Error('Ожидается 2 значения');
    }
    checkNumbers(param);
    return param;
};

const nary_validator = (param) => {
    if (!Array.isArray(param)) {
        throw new Error('Ожидается массив');
    }
    if (param.length < 1) {
        throw new Error('Ожидается хотя бы одно значение');
    }
    checkNumbers(param);
    return param;
};

server.on('sum', nary_validator, (params, response) => {
    response(null, params.reduce((acc, value) => acc + value, 0));
});

server.on('mul', nary_validator, (params, response) => {
    response(null, params.reduce((acc, value) => acc * value, 1));
});

server.on('div', bin_validator, (params, response) => {
    response(null, params[0] / params[1]);
});

server.on('proc', bin_validator, (params, response) => {
    response(null, (params[0] / params[1]) * 100);
});

server.listenHttp({ host: '127.0.0.1', port: 5001 }, () => {
    console.log('JSON-RPC Server READY');
});

