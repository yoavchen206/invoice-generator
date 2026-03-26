import axios from 'axios';
import { env } from '../config';

export const invoice4uClient = axios.create({
  baseURL: env.INVOICE4U_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
invoice4uClient.interceptors.request.use((config) => {
  return config;
});

// Response interceptor for error normalization
invoice4uClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // API responded with error status
      const status = error.response.status;
      const data = error.response.data;

      const normalizedError = {
        status,
        code: data?.code || 'INVOICE4U_ERROR',
        message: data?.message || 'An error occurred with the invoice4u API',
        data: data,
      };

      return Promise.reject(normalizedError);
    } else if (error.request) {
      // Request was made but no response
      return Promise.reject({
        status: 503,
        code: 'UPSTREAM_UNAVAILABLE',
        message: 'Invoice4u API is currently unavailable',
      });
    }

    return Promise.reject({
      status: 500,
      code: 'INTERNAL_ERROR',
      message: error.message || 'Internal error',
    });
  }
);

export function createAuthenticatedClient(token: string) {
  const client = axios.create({
    baseURL: env.INVOICE4U_API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        return Promise.reject({
          status,
          code: data?.code || 'INVOICE4U_ERROR',
          message: data?.message || 'An error occurred with the invoice4u API',
          data: data,
        });
      } else if (error.request) {
        return Promise.reject({
          status: 503,
          code: 'UPSTREAM_UNAVAILABLE',
          message: 'Invoice4u API is currently unavailable',
        });
      }
      return Promise.reject({
        status: 500,
        code: 'INTERNAL_ERROR',
        message: error.message || 'Internal error',
      });
    }
  );

  return client;
}
