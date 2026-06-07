const express = require('express');
const routes = require('./routes/routeTable');
const controllerTable = require('./controllers/controllerTable'); 
const view = require('./views/jsonView');

const app = express();

const PORT = 5001;

app.use(express.json()); 

function callAction(route, req, res) {
  const actionDescription = controllerTable.students[route.action];

  if (!actionDescription) {
    return view.error(res, 500, 'действия контроллера нет!');
  }

  if (actionDescription.method !== req.method) {
    return view.error(res, 405, `нужен метод ${actionDescription.method}`);
  }

  const requestData = {
    params: req.params,
    query: req.query,
    body: req.body,
  };

  return actionDescription.action(requestData, res);  
}

routes.forEach((route) => {
  app.all(route.path, (req, res) => callAction(route, req, res));
});

app.use((req, res) => {
  view.error(res, 404, 'маршрут не найден');
});

app.listen(PORT, () => { 
  console.log(`express http сервер запущен на порту ${PORT}`);
});
