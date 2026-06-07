module.exports = [
  {
    path: '/students',
    controller: 'students',
    action: 'getAll',
  },
  {
    path: '/students/create',
    controller: 'students',
    action: 'create',
  },
  {
    path: '/students/:id/update',
    controller: 'students',
    action: 'update',
  },
  {
    path: '/students/:id/delete',
    controller: 'students',
    action: 'remove',
  },
  {
    path: '/students/:id',
    controller: 'students',
    action: 'getById',
  },
];
