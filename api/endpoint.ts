type ID = string | number;

const API_ENDPOINTS = {
  StorefrontBrowse: {
    getBranches: "/storefront/branches/?restaurant={{restaurant_id}}",
    getAreas: "/storefront/areas/?restaurant={{restaurant_id}}",
    getMenu: "/storefront/menu/?branch={{branch_id}}&area={{area_id}}",
  },

  StorefrontCart: {
    getCart: "/storefront/cart/?cart_token={{cart_token}}",
    addCart: "/storefront/cart/items/",
    addAnotherItemToSameCart: "/storefront/cart/items/",
    updateCartQuantity:
      "/storefront/cart/items/{{cart_item_id}}/?cart_token={{cart_token}}",
    removeCartItem:
      "/storefront/cart/items/{{cart_item_id}}/?cart_token={{cart_token}}",
  },

  StorefrontCheckout: {
    checkoutGuest: "/storefront/checkout/",
    checkoutLoggedInCustomer: "/storefront/checkout/",
    getOrder: "/storefront/orders/{{order_id}}/",
  },

  StorefrontCustomerAuth: {
    login: "/storefront/customers/login/",
    register: "/storefront/customers/register/",
    getCustomer: "/storefront/customer/",
    updateCustomer: "/storefront/customer/",
    deleteCustomer: "/storefront/customer/",
    refreshToken: "/storefront/customers/refresh",
    getMyProfile: "/storefront/customers/me/",
    updateMyProfile: "/storefront/customers/me/",
    addAddress: "/storefront/customers/addresses/",
    getAddresses: "/storefront/customers/addresses/",
    updateAddress:
      "/storefront/customers/addresses/{{customer_address_id}}/",
    deleteAddress:
      "/storefront/customers/addresses/{{customer_address_id}}/",
    getOrderHistory: "/storefront/customers/orders/",
  },
} as const;

export default API_ENDPOINTS;