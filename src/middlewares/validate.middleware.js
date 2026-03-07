const AppError = require("../utils/appError");

module.exports = (schema, source = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return next(new AppError(error.details.map((d) => d.message).join(", "), 400, "VALIDATION_ERROR"));
    }

    req[source] = value;
    return next();
  };
};
