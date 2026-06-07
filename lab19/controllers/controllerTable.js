const studentController = require('./studentController');

module.exports = {
  students: {
    getAll: {
      method: 'GET',
      action: studentController.getAll,
    },
    getById: {
      method: 'GET',
      action: studentController.getById,
    },
    create: {
      method: 'POST',
      action: studentController.create,
    },
    update: {
      method: 'PUT',
      action: studentController.update,
    },
    remove: {
      method: 'DELETE',
      action: studentController.remove,
    },
  },
};
