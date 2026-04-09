const EventEmitter = require('events');

var db_data = [
    { id: 1, name: 'Гончар Александр', bday: '14.06.2006' },
    { id: 2, name: 'Куницкий Глеб',    bday: '01.01.1937' },
    { id: 3, name: 'Санюк Иван',       bday: '17.05.2011' }
];

var nextId = 4;

class DB extends EventEmitter {
    constructor() {
        super();
    }

    select(callback) {
        this.emit('GET');
        setImmediate(() => {
            callback(null, db_data.slice());
        });
    }

    insert(r, callback) {
        this.emit('POST', r);

        setImmediate(() => {
            var row = { id: nextId++, name: r.name || '', bday: r.bday || '' };
            db_data.push(row);
            callback(null, row);
        });
    }

    update(r, callback) {
        this.emit('PUT', r);

        setImmediate(() => {
            for (var i = 0; i < db_data.length; i++) {
                if (db_data[i].id === r.id) {
                    if (r.name !== undefined) {
                        db_data[i].name = r.name;
                    }
                    if (r.bday !== undefined) {
                        db_data[i].bday = r.bday;
                    }

                    return callback(null, db_data[i]);
                }
            }
            callback(null, null);
        });
    }

    delete(id, callback) {
        var numId = parseInt(id, 10);

        this.emit('DELETE', numId);

        setImmediate(() => {
            for (var i = 0; i < db_data.length; i++) {
                if (db_data[i].id === numId) {
                    var deleted = db_data.splice(i, 1)[0];
                    return callback(null, deleted);
                }
            }

            callback(null, null);
        });
    }

    commit() {
        this.emit('COMMIT');
    }
}

exports.DB = DB;
