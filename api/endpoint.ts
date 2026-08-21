const API_ENDPOINTS = {
  StorefrontBrowse: {
    getBranches: '/storefront/branches/',   // ?restaurant=<id>
    getAreas:    '/storefront/areas/',      // ?branch=<id> or ?restaurant=<id>
    getCities:   '/storefront/cities/',     // ?restaurant=<id>
    getMenu:     '/storefront/menu/',       // ?branch=<id>&area=<id optional>
    locate:      '/storefront/locate/',     // ?lat=<lat>&lng=<lng>&restaurant=<id optional>
  },

  StorefrontCheckout: {
    checkout: '/storefront/checkout/',   // POST
  },

  StorefrontCustomerAuth: {
    login:           '/storefront/customers/login/',
    register:        '/storefront/customers/register/',
    refreshToken:    '/storefront/customers/refresh/',
    getMyProfile:    '/storefront/customers/me/',
    updateMyProfile: '/storefront/customers/me/',
    deleteCustomer:  '/storefront/customers/me/',
    addAddress:      '/storefront/customers/addresses/',
    getAddresses:    '/storefront/customers/addresses/',
    updateAddress:   '/storefront/customers/addresses/{{customer_address_id}}/',
    deleteAddress:   '/storefront/customers/addresses/{{customer_address_id}}/',
    getOrderHistory: '/storefront/customers/orders/',
  },
} as const;

export default API_ENDPOINTS;
