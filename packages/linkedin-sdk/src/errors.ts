export class SDKError extends Error {
  constructor(message: string, public readonly code: string, public readonly statusCode?: number) {
    super(message);
    this.name = 'LinkedInSDKError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class SDKValidationError extends SDKError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'SDKValidationError';
  }
}

export class SDKNetworkError extends SDKError {
  constructor(message: string, statusCode?: number) {
    super(message, 'NETWORK_ERROR', statusCode);
    this.name = 'SDKNetworkError';
  }
}

export class SDKExecutionError extends SDKError {
  constructor(message: string, code = 'EXECUTION_ERROR') {
    super(message, code, 500);
    this.name = 'SDKExecutionError';
  }
}
