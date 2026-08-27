const API_ENDPOINTS = {
  StorefrontBrowse: {
    getBranches:    '/storefront/branches/',    // ?restaurant=<id>
    getCities:      '/storefront/cities/',      // ?branch=<branch_id>  ← NEW: filtered by branch
    getAreas:       '/storefront/areas/',       // ?city=<city_id>       ← NEW: filtered by city
    getMenu:        '/storefront/menu/',        // ?branch=<id>&area=<id optional>
    locate:         '/storefront/locate/',      // ?lat=<lat>&lng=<lng>&restaurant=<id optional>
  },

  StorefrontDeals: {
    fixedDeals:    '/storefront/fixed-deals/',   // ?restaurant=<id>&status=true
    onSpotDeals:   '/storefront/on-spot-deals/', // ?restaurant=<id>&status=true
  },

  StorefrontCheckout: {
    checkout: '/storefront/checkout/',
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
