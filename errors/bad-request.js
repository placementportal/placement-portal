const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("./custom-api");

class BadRequestError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.BAD_REQUEST;
    this.success = false;
  }
}

module.exports = BadRequestError;