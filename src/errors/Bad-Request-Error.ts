import { CustomError } from "./Custom-Error";

export class BadRequestError extends CustomError {
  statusCode = 400;
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
  serializeErrors() {
    return [{ message: this.message }];
  }
}
