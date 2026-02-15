export class ErrorHandler {
  static extractErrorMessage(err: any, defaultMessage = 'An error occurred. Please try again.'): string {
    // Case 1: Direct message in err.error.message
    if (err?.error?.message && typeof err.error.message === 'string') {
      return err.error.message;
    }

    // Case 2: Multiple validation errors (err.error as object with field errors)
    if (err?.error && typeof err.error === 'object') {
      // Skip metadata fields like status, error, path
      const errorFields = Object.keys(err.error).filter(
        key => !['status', 'error', 'path', 'timestamp'].includes(key)
      );
      
      if (errorFields.length > 0) {
        const firstError = err.error[errorFields[0]];
        if (typeof firstError === 'string') {
          return firstError;
        }
      }
    }

    // Case 3: Fallback to default message
    return defaultMessage;
  }
}
