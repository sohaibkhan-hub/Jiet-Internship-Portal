class ApiError extends Error {
  constructor(statusCode, message = "Something went wrong", errors = "") {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.errors = errors;
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      success: this.success,
      data: this.data,
      message: this.message,
      errors: this.errors,
    };
  }
}

export { ApiError };
