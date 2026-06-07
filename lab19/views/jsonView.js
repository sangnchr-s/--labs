function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    status: 'success',
    data,
  });
}

function error(res, statusCode, message) {
  return res.status(statusCode).json({
    status: 'error',
    message,
  });
}

module.exports = {
  success,
  error,
};
