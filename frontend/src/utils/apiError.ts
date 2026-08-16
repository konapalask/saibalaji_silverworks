/**
 * Safely extracts a human-readable error message from an API error response.
 * Handles FastAPI's validation error arrays, error objects, string details, and network errors.
 */
export const getErrorMessage = (err: any, fallbackMessage: string = 'An unexpected error occurred'): string => {
  if (!err) return fallbackMessage;

  const detail = err.response?.data?.detail;

  if (typeof detail === 'string') {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item: any) => {
        if (typeof item === 'string') return item;
        if (item?.msg) {
          const field = Array.isArray(item.loc) ? item.loc[item.loc.length - 1] : '';
          return field ? `${field}: ${item.msg}` : item.msg;
        }
        return JSON.stringify(item);
      })
      .join('; ');
  }

  if (typeof detail === 'object' && detail !== null) {
    if (detail.msg) return detail.msg;
    return JSON.stringify(detail);
  }

  if (err.message && typeof err.message === 'string') {
    return err.message;
  }

  return fallbackMessage;
};
