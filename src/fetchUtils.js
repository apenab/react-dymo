class FetchError extends Error {
  constructor(message, response, isAborted = false) {
    super(message);
    this.name = 'FetchError';
    this.response = response;
    this.isAborted = isAborted;
  }
}

export function isAbortError(error) {
  return error instanceof FetchError && error.isAborted;
}

export async function fetchWithRetry(url, options = {}, retryConfig = {}) {
  const { maxRetries = 0, retryCondition, onRetry } = retryConfig;
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok && (!retryCondition || retryCondition(response))) {
        throw new FetchError(`HTTP error! status: ${response.status}`, response);
      }
      
      return response;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new FetchError('Request aborted', null, true);
      }
      
      lastError = error;
      
      if (attempt < maxRetries && (!retryCondition || retryCondition(error.response))) {
        if (onRetry) {
          await onRetry(error, attempt);
        }
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
}

export function createFetchInstance() {
  const interceptors = {
    response: []
  };
  
  return {
    interceptors,
    
    async request(config) {
      const { url, method = 'GET', data, headers = {}, signal, ...otherOptions } = config;
      
      const options = {
        method,
        headers: { ...headers },
        signal,
        ...otherOptions
      };
      
      if (data) {
        if (typeof data === 'string') {
          options.body = data;
          if (!options.headers['Content-Type']) {
            options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
          }
        } else if (data instanceof FormData) {
          options.body = data;
        } else {
          options.body = JSON.stringify(data);
          if (!options.headers['Content-Type']) {
            options.headers['Content-Type'] = 'application/json';
          }
        }
      }
      
      let response;
      try {
        response = await fetch(url, options);
      } catch (error) {
        if (error.name === 'AbortError') {
          throw new FetchError('Request aborted', null, true);
        }
        throw error;
      }
      
      // Run response interceptors
      for (const interceptor of this.interceptors.response) {
        try {
          response = await interceptor.onFulfilled(response, config);
        } catch (error) {
          if (interceptor.onRejected) {
            response = await interceptor.onRejected(error, config);
          } else {
            throw error;
          }
        }
      }
      
      return response;
    }
  };
}