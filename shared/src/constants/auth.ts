export const AUTH_CONFIG = {
  COOKIE_NAMES: {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
  },
  PATHS: {
    REFRESH_TOKEN: '/api/auth/refresh',
  },
  EXPIRATION: {
    // Current fix is 7 days for access token cookie to allow client-side refresh on the frontend
    ACCESS_TOKEN_COOKIE_MAX_AGE: 60 * 60 * 24 * 7, 
    // Default refresh token expiration (1 hour)
    REFRESH_TOKEN_MAX_AGE_MS: 3600000, 
  }
};
