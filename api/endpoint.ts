type ID = string | number;

const API_ENDPOINTS = {
  StorefrontBrowse: {
    getBranches: "/storefront/branches/",        // ?restaurant=<id>
    getAreas:    "/storefront/areas/",           // ?branch=<id>
    getMenu:     "/storefront/menu/",            // ?branch=<id>&area=<id optional>
  },

  StorefrontCart: {
    getCart:                 "/storefront/cart/",          // ?cart_token=<token>
    addCart:                 "/storefront/cart/items/",
    addAnotherItemToSameCart:"/storefront/cart/items/",
    updateCartQuantity:      "/storefront/cart/items/{{cart_item_id}}/", // ?cart_token=<token>
    removeCartItem:          "/storefront/cart/items/{{cart_item_id}}/", // ?cart_token=<token>
  },

  StorefrontCheckout: {
    checkoutGuest:            "/storefront/checkout/",
    checkoutLoggedInCustomer: "/storefront/checkout/",
    getOrder:                 "/storefront/orders/{{order_id}}/",
  },

  StorefrontCustomerAuth: {
    login:          "/storefront/customers/login/",
    register:       "/storefront/customers/register/",
    refreshToken:   "/storefront/customers/refresh/",     // fixed: was missing trailing slash
    getMyProfile:   "/storefront/customers/me/",
    updateMyProfile:"/storefront/customers/me/",
    // getCustomer / updateCustomer / deleteCustomer all map to /me/
    getCustomer:    "/storefront/customers/me/",
    updateCustomer: "/storefront/customers/me/",
    deleteCustomer: "/storefront/customers/me/",          // no delete endpoint in backend — kept for compatibility
    addAddress:     "/storefront/customers/addresses/",
    getAddresses:   "/storefront/customers/addresses/",
    updateAddress:  "/storefront/customers/addresses/{{customer_address_id}}/",
    deleteAddress:  "/storefront/customers/addresses/{{customer_address_id}}/",
    getOrderHistory:"/storefront/customers/orders/",
  },
} as const;

export default API_ENDPOINTS;