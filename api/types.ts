// ─── Shared pagination wrapper (DRF PageNumberPagination) ────────────────────

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

// ─── Common query params supported by all list endpoints ─────────────────────

export type ListParams = {
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
};

// ─── Common DRF error shape ───────────────────────────────────────────────────

export type ApiError = {
  detail?: string;
  [key: string]: unknown;
};

export function extractErrorMessage(err: unknown): string {
  if (err && typeof err === "object") {
    const e = err as ApiError;
    if (typeof e.detail === "string") return e.detail;
    const firstField = Object.values(e)[0];
    if (Array.isArray(firstField)) return firstField[0] as string;
    if (typeof firstField === "string") return firstField;
  }
  return "Something went wrong. Please try again.";
}

// ─── User ─────────────────────────────────────────────────────────────────────

export type User = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: number | null;
  role_name: string | null;
  group: number | null;
  group_name: string | null;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
  created_at: string;
  updated_at: string;
};

export type CreateUserPayload = {
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: number | null;
  group?: number | null;
  password: string;
  password_confirm: string;
};

export type UpdateUserPayload = {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: number | null;
  group?: number | null;
  is_active?: boolean;
  password?: string;
};

export type UsersListParams = ListParams & {
  is_active?: boolean;
  role?: number;
  group?: number;
};

// ─── Role ─────────────────────────────────────────────────────────────────────

export type Role = {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateRolePayload = {
  name: string;
  description?: string;
  permissions?: string[];
  is_active?: boolean;
};

export type UpdateRolePayload = Partial<CreateRolePayload>;

export type RolesListParams = ListParams & {
  is_active?: boolean;
};

// ─── Group ────────────────────────────────────────────────────────────────────

export type Group = {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateGroupPayload = {
  name: string;
  description?: string;
  is_active?: boolean;
};

export type UpdateGroupPayload = Partial<CreateGroupPayload>;

export type GroupsListParams = ListParams & {
  is_active?: boolean;
};

// ─── Restaurant ───────────────────────────────────────────────────────────────

export type Restaurant = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  owner: number | null;
  owner_username: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateRestaurantPayload = {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  owner?: number | null;
  is_active?: boolean;
};

export type UpdateRestaurantPayload = Partial<CreateRestaurantPayload>;

export type RestaurantsListParams = ListParams & {
  is_active?: boolean;
  city?: string;
};

// ─── Storefront Browse ───────────────────────────────────────────────────────

export type Branch = {
  id: number;
  name?: string;           // standard DRF field
  branch_name?: string;    // actual API field name
  address?: string;
  location?: string;       // API may return location instead of address
  city?: string;
  phone?: string;
  latitude?: string | null;
  longitude?: string | null;
  map_location?: string | null;  // "lat,lng" string from API
  is_active?: boolean;
  status?: boolean;        // API uses status instead of is_active
  opening_time?: string | null;
  closing_time?: string | null;
  pickup_status?: boolean;
  delivery_status?: boolean;
  is_default?: boolean;
  restaurant?: number;
  created_at?: string;
  updated_at?: string;
};

export type Area = {
  id: number;
  name: string;
  city: string;
  branch?: number | null;
  branch_name?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type MenuCategory = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  badge?: string | null;
  sort_order: number;
  is_active: boolean;
  sub_categories: MenuSubCategory[];
};

export type MenuSubCategory = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  sort_order: number;
  is_active: boolean;
  products: Product[];
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  base_price: string;
  original_price?: string | null;
  from_label?: boolean;
  image?: string | null;
  tag?: string | null;
  discount?: string | null;
  branch_ids?: (string | number)[] | '*';
  options: ProductOption[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductOption = {
  id: number;
  name: string;
  price_adjustment?: string | number;
};

export type MenuResponse = {
  // Backend returns the full storefront payload from GET /storefront/menu/
  branch:           Record<string, unknown>;
  area:             Record<string, unknown> | null;
  settings:         Record<string, unknown>;
  branch_settings:  Record<string, unknown>;
  business_hours:   unknown[];
  sizes:            unknown[];
  addon_categories: unknown[];
  // The actual menu tree — categories each containing items directly
  menu: MenuCategory[];
  // Fallback: some versions expose a flat `categories` key instead of `menu`
  categories?: MenuCategory[];
};

// ─── Storefront Cart ─────────────────────────────────────────────────────────

export type CartItem = {
  id: number;
  cart: number;
  product: number;
  product_name: string;
  product_image?: string | null;
  variant?: number | null;
  variant_name?: string | null;
  quantity: number;
  unit_price: string;
  subtotal: string;
  options?: Record<string, unknown> | null;
  special_instructions?: string | null;
  created_at: string;
  updated_at: string;
};

export type Cart = {
  token: string;
  customer?: number | null;
  branch?: number | null;
  area?: number | null;
  items: CartItem[];
  subtotal: string;
  tax?: string;
  discount?: string;
  total: string;
  total_items: number;
  created_at: string;
  updated_at: string;
};

export type AddCartItemPayload = {
  product: number;
  quantity: number;
  variant?: number;
  options?: Record<string, unknown>;
  special_instructions?: string;
  cart_token?: string;
  branch?: number;
  area?: number;
};

export type UpdateCartItemPayload = {
  quantity: number;
};

// ─── Storefront Checkout ─────────────────────────────────────────────────────

export type CheckoutPayloadBase = {
  cart_token: string;
  branch?: number;
  area?: number;
  order_type: 'delivery' | 'pickup';
  payment_method: 'cod' | 'card' | 'online' | 'wallet';
  subtotal: number | string;
  tax?: number | string;
  delivery_fee?: number | string;
  discount?: number | string;
  total: number | string;
  special_instructions?: string;
  voucher_code?: string;
  change_amount?: string | number;
  is_gift?: boolean;
};

export type GuestCheckoutPayload = CheckoutPayloadBase & {
  customer_type: 'guest';
  title?: string;
  first_name: string;
  last_name?: string;
  phone: string;
  alt_phone?: string;
  email?: string;
  address?: string;
  landmark?: string;
  city?: string;
};

export type LoggedInCheckoutPayload = CheckoutPayloadBase & {
  customer_type: 'logged_in';
  address_id?: number;
  address?: string;
  city?: string;
  customer_name?: string;
  customer_phone?: string;
};

export type OrderItem = {
  id: number;
  product: number;
  product_name: string;
  product_image?: string | null;
  variant_name?: string | null;
  quantity: number;
  unit_price: string;
  subtotal: string;
};

export type Order = {
  id: number;
  order_no: string;
  order_type: 'delivery' | 'pickup';
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  status:
    | 'received'
    | 'accepted'
    | 'preparing'
    | 'ready'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled';
  branch: number;
  branch_name?: string;
  area?: number | null;
  area_name?: string | null;
  customer?: number | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  delivery_address?: string | null;
  subtotal: string;
  tax: string;
  delivery_fee: string;
  discount: string;
  total: string;
  special_instructions?: string | null;
  voucher_code?: string | null;
  items: OrderItem[];
  placed_at: string;
  estimated_delivery_at?: string | null;
  delivered_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type CheckoutResponse = {
  success: boolean;
  order: Order;
  message?: string;
  redirect_url?: string | null;
};

// ─── Storefront Customer Auth & Profile ──────────────────────────────────────

// ─── Customer Registration (matches CustomerRegisterSerializer) ───────────────
// Backend fields: restaurant (id), name, phone, email?, password, password_confirm

export type RegisterPayload = {
  restaurant: number;      // required — FK to Restaurant
  name: string;            // required — customer display name
  phone: string;           // required — unique per restaurant
  email?: string;          // optional
  password: string;        // required — min 8 chars (Django validator)
  password_confirm: string;// required — must match password
};

// Backend register/login response: { access, refresh, customer: { id, restaurant, name, phone, email, is_active, date_joined } }
export type CustomerLoginResponse = {
  access: string;
  refresh: string;
  customer: {
    id: number;
    restaurant: number;
    name: string;
    phone: string;
    email: string;
    is_active: boolean;
    date_joined: string;
  };
  // Legacy fallback — some versions return `user` instead of `customer`
  user?: {
    id: number;
    username?: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    gender?: string | null;
    is_active: boolean;
    date_joined: string;
  };
};

export type CustomerUser = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  gender?: string | null;
  is_active: boolean;
  date_joined: string;
};

export type CustomerProfile = {
  id: number;
  user: CustomerUser;
  gender?: string | null;
  phone: string;
  default_address?: number | null;
  created_at: string;
  updated_at: string;
};

export type UpdateCustomerPayload = {
  first_name?: string;
  last_name?: string;
  email?: string;
  gender?: string;
};

export type CustomerAddress = {
  id: number;
  customer: number;
  label?: string | null;
  address: string;        // backend field name (not line1)
  landmark?: string | null;
  city: string;
  is_default: boolean;
  created_at: string;
};

export type AddAddressPayload = {
  label?: string;
  address: string;        // required by backend
  landmark?: string;
  city?: string;
  is_default?: boolean;
};

export type UpdateAddressPayload = Partial<AddAddressPayload>;

export type OrderHistoryItem = {
  id: number;
  order_no: string;
  order_type: string;
  status: string;
  total: string;
  placed_at: string;
  estimated_delivery_at?: string | null;
  delivered_at?: string | null;
  branch_name?: string | null;
  payment_method: string;
  items_count: number;
};
