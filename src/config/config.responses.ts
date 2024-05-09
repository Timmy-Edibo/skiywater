export const createSuccessResponse = (data: Object) => ({
    success: true,
    data,
    error: null
  });

export const createErrorResponse = (message: string, details = []) => ({
    success: false,
    data: null,
    error: { message, details }
  });
