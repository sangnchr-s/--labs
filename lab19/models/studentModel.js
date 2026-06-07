let students = [
  { id: 1, name: 'Ivan', group: 'STSR' },
  { id: 2, name: 'Petr', group: 'STSR' },
];

let nextId = 3;

function getAll() {
  return students;
}

function getById(id) {
  return students.find((student) => student.id === Number(id));
}

function create(data) {
  const student = {
    id: nextId,
    name: data.name || `Student ${nextId}`,
    group: data.group || 'unknown',
  };

  nextId += 1;
  students.push(student);

  return student;
}

function update(id, data) {
  const student = getById(id);

  if (!student) {
    return null;
  }

  student.name = data.name || student.name;
  student.group = data.group || student.group;

  return student;
}

function remove(id) {
  const student = getById(id);

  if (!student) {
    return null;
  }

  students = students.filter((item) => item.id !== student.id);
  return student;
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
