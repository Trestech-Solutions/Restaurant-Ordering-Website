type ID = string | number;

const API_ENDPOINTS = {
  auth: {
    login:          "/auth/login/",
    refresh:        "/auth/refresh/",
    logout:         "/auth/logout/",
    forgotPassword: "/auth/forgot-password/",
    resetPassword:  "/auth/reset-password/",
  },


} as const;

export default API_ENDPOINTS;
