export default class ApplicationError extends Error {
    statusCode = 500;
    name = "InternalError";
    err = "Error";
 
    constructor(message, options = {}) {
      super(message);
 
      for (const [key, value] of Object.entries(options)) {
         this[key] = value;
      }
    }
 }