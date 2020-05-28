
class HTTPError extends Error {
  constructor(httpCode, message) {
    super(message);
    this.httpCode = httpCode
  }
}

module.exports = HTTPError;
