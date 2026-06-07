const studentModel = require('../models/studentModel');
const view = require('../views/jsonView');

function getAll(data, res) {
  return view.success(res, studentModel.getAll());
}

function getById(data, res) {
  const student = studentModel.getById(data.params.id);

  if (!student) {
    return view.error(res, 404, 'Student not found');
  }

  return view.success(res, student);
}

function create(data, res) {
  const student = studentModel.create(data.body);
  return view.success(res, student, 201);
}

function update(data, res) {
  const student = studentModel.update(data.params.id, data.body);

  if (!student) {
    return view.error(res, 404, 'Student not found');
  }

  return view.success(res, student);
}

function remove(data, res) {
  const student = studentModel.remove(data.params.id);

  if (!student) {
    return view.error(res, 404, 'Student not found');
  }

  return view.success(res, {
    deleted: student,
  });
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
