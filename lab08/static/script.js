const jsonOut = document.getElementById('json-output');
const xmlOut = document.getElementById('xml-output');

fetch('/data.json')
    .then(function (res) { return res.text(); })
    .then(function (text) {
        jsonOut.textContent = text;
    })
    .catch(function () {
        jsonOut.textContent = 'Ошибка загрузки data.json';
    });

fetch('/data.xml')
    .then(function (res) { return res.text(); })
    .then(function (text) {
        xmlOut.textContent = text;
    })
    .catch(function () {
        xmlOut.textContent = 'Ошибка загрузки data.xml';
    });
