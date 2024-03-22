// Extract error messages from express-validator errors
exports.getErrorMessages = (errorObject) => {
  let array = [];
  const errors = errorObject.errors;
  for (const error of errors) {
    array.push({ error: error.msg });
  }
  return array;
};
