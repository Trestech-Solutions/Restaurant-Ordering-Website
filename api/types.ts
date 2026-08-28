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
  name?: string;
  branch_name?: string;
  address?: string;
  location?: string;
  city?: string;
  phone?: string;
  latitude?: string | null;
  longitude?: string | null;
  map_location?: string | null;
  is_active?: boolean;
  status?: boolean;
  opening_time?: string | null;
  closing_time?: string | null;
  pickup_status?: boolean;
  delivery_status?: boolean;
  is_default?: boolean;
  restaurant?: number;
  created_at?: string;
  updated_at?: string;
};

export type City = {
  id: number;
  name: string;
  status?: boolean;
  branch: number;          // FK to Branch
  branch_name?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  radius_km?: string | null;
};

export type Area = {
  id: number;
  name: string;
  city?: number;          // NEW: FK to City (primary relationship)
  city_name?: string;     // NEW: read-only
  status?: boolean;
  branch?: number | null; // kept for compat
  branch_name?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type LocateResponse = {
  success: boolean;
  city_id?: number;
  city_name?: string;
  branch_id?: number;
  area_id?: number | null;
  area_name?: string | null;
};

// ─── Menu types — matches actual API response ────────────────────────────────

/**
 * A size-level price record as returned by ItemSerializer.size_prices[].
 * Each item may have multiple sizes (Regular/Large etc.) each with its own
 * price, discount value and discount type.
 */
export type SizePrice = {
  id: number;                    // PK of ItemSizePrice — send as `variant` to cart
  size: number;                  // FK to Size (id)
  size_name: string;             // Human readable size (e.g. "Large")
  price: string;                 // Current / effective price for this size (after discount)
  discount: string | null;       // Discount value — semantics depend on discount_type
  discount_type: 'fixed' | 'percent' | string | null;
};

/**
 * An Item object as returned by the menu endpoint (via ItemSerializer +
 * price_at_branch injection). These are the records to pass as `item` to
 * POST /storefront/cart/items/.
 */
export type MenuItem = {
  id: number;
  restaurant?: number;
  item_sku?: string;
  name: string;
  description?: string | null;
  status?: boolean;
  feature_image?: string | null;  // product image
  front_price?: string;           // base price
  price_at_branch?: string;       // branch-overridden price (injected by MenuView)
  item_discount?: string | null;
  item_discount_type?: string | null;
  show_discount_tag?: boolean;
  branch_prices?: unknown[];
  size_prices?: SizePrice[];
  date_added?: string;
  date_updated?: string;
};

/**
 * A "Dish" — category grouping label linked via M2M. NOT the same as Item.
 * These appear in dish_detail[] and are NOT valid cart item IDs.
 */
export type MenuDish = {
  id: number;
  restaurant?: number;
  name: string;
  description?: string | null;
  status?: boolean;
  // Legacy/compat fields — may be absent
  base_price?: string | null;
  original_price?: string | null;
  image?: string | null;
  tag?: string | null;
  discount?: string | null;
  slug?: string;
  from_label?: boolean;
  branch_ids?: (string | number)[] | '*';
  options?: ProductOption[];
  created_by?: number;
  updated_by?: number;
  date_added?: string;
  date_updated?: string;
};

export type MenuCategory = {
  id: number;
  restaurant?: number;
  name: string;
  description?: string | null;
  banner?: string | null;
  icon?: string | null;
  badge?: string | null;
  status?: boolean;
  is_active?: boolean;
  sort_order?: number;
  // ── ACTUAL API FIELDS ──────────────────────────────────────────────────────
  // items[] = Item objects (injected by MenuView) — use these IDs for cart
  items?: MenuItem[];
  // dish[] / dish_detail[] = Dish M2M (grouping labels, NOT cart-compatible)
  dish?: number[];
  dish_detail?: MenuDish[];
  // ── Legacy sub-category shape ──────────────────────────────────────────────
  sub_categories?: MenuSubCategory[];
  // Display flags
  hide_category?: boolean;
  hide_category_from_navbar?: boolean;
  hide_category_display_name_menu?: boolean;
  layout?: string;
  date_added?: string;
  date_updated?: string;
};

/** Legacy sub-category shape — kept for backward compat */
export type MenuSubCategory = {
  id: number;
  name: string;
  slug?: string;
  description?: string | null;
  sort_order?: number;
  is_active?: boolean;
  products?: Product[];
};

/** Legacy full product type (older API) */
export type Product = {
  id: number;
  name: string;
  slug?: string;
  description?: string | null;
  base_price: string;
  original_price?: string | null;
  from_label?: boolean;
  image?: string | null;
  tag?: string | null;
  discount?: string | null;
  branch_ids?: (string | number)[] | '*';
  options: ProductOption[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ProductOption = {
  id: number;
  name: string;
  price_adjustment?: string | number;
};

export type MenuSize = {
  id: number;
  restaurant: number;
  name: string;
  description?: string | null;
  status?: boolean;
};

export type MenuAddonCategory = {
  id: number;
  restaurant: number;
  name: string;
  description?: string | null;
  status?: boolean;
  addons?: unknown[];
};

export type MenuResponse = {
  branch:           Branch;
  area:             Area | null;
  settings:         Record<string, unknown>;
  branch_settings:  Record<string, unknown>;
  business_hours:   unknown[];
  sizes:            MenuSize[];
  addon_categories: MenuAddonCategory[];
  // Actual API returns `menu` array of categories
  menu:             MenuCategory[];
  // Deals — injected at top-level alongside menu
  fixed_deals?:    MenuFixedDeal[];
  on_spot_deals?:  MenuOnSpotDeal[];
  // Legacy fallback
  categories?:      MenuCategory[];
};

// ─── Storefront Deal types (as returned inside menu response) ─────────────────

export type MenuDealItemDetail = {
  id: number;
  item: number;
  item_detail?: MenuItem;
  quantity: number;
};

export type MenuOnSpotDealGroupOption = {
  id: number;
  item: number;
  item_detail?: MenuItem;
  quantity: number;
};

export type MenuOnSpotDealGroup = {
  id: number;
  name: string;
  select_quantity: number;
  options: MenuOnSpotDealGroupOption[];
};

/** Shape of a Fixed Deal as returned inside the menu endpoint response. */
export type MenuFixedDeal = {
  id: number;
  restaurant: number;
  category: number;            // FK — which menu category this deal belongs to
  category_detail?: MenuCategory;
  name: string;
  description?: string | null;
  feature_image?: string | null;  // NOTE: field name is feature_image (not image)
  price: string;
  discount?: string;
  discount_type?: 'fixed' | 'percentage';
  final_price: string;
  items_detail?: MenuDealItemDetail[];
  valid_from_date?: string | null;
  valid_to_date?: string | null;
  start_time?: string | null;  // "HH:MM:SS" — time window filter (PKT)
  end_time?: string | null;    // "HH:MM:SS" — time window filter (PKT)
  status: boolean | number;    // API returns 1/0 or true/false
  is_available_now?: boolean;
};

/** Shape of an On Spot Deal as returned inside the menu endpoint response. */
export type MenuOnSpotDeal = {
  id: number;
  restaurant: number;
  category: number;            // FK — which menu category this deal belongs to
  category_detail?: MenuCategory;
  name: string;
  description?: string | null;
  feature_image?: string | null;  // NOTE: field name is feature_image (not image)
  price: string;
  discount?: string;
  discount_type?: 'fixed' | 'percentage';
  final_price: string;
  items_detail?: MenuDealItemDetail[];
  groups_detail?: MenuOnSpotDealGroup[];
  valid_from_date?: string | null;
  valid_to_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  status: boolean | number;    // API returns 1/0 or true/false
  is_available_now?: boolean;
};

// ─── Storefront Cart ─────────────────────────────────────────────────────────

export type CartItem = {
  id: number;
  cart: number;
  item: number;              // backend field name (was `product`)
  item_name: string;         // backend field name (was `product_name`)
  size?: number | null;
  size_detail?: { id: number; name: string } | null;
  quantity: number;
  notes?: string;
  unit_price: string;
  line_total: string;
  addons?: { id: number; addon: number; quantity: number }[];
};

export type Cart = {
  id: number;
  token: string;
  branch: number;
  area?: number | null;
  items: CartItem[];
  subtotal: string;
  created_at?: string;
  updated_at?: string;
};

export type AddCartItemPayload = {
  item: number;           // backend field name (was `product`)
  branch: number;         // required by backend
  quantity: number;
  size?: number;          // optional size ID (was `variant`)
  notes?: string;         // optional (was `special_instructions`)
  addons?: { addon: number; quantity?: number }[];
  cart_token?: string;
  area?: number;
};

export type UpdateCartItemPayload = {
  quantity: number;
};

// ─── Storefront Checkout ─────────────────────────────────────────────────────

export type CheckoutPayload = {
  cart_token: string;
  order_type: 'delivery' | 'pickup' | 'dinein';
  customer_name: string;
  customer_phone: string;
  customer_city?: string;
  customer_address?: string;
  customer_landmark?: string;
  customer_instructions?: string;
};

export type OrderItemAddon = {
  id: number;
  addon: number;
  addon_name: string;
  unit_price: string;
  quantity: number;
};

export type OrderItem = {
  id: number;
  item: number;
  item_name: string;
  size?: number | null;
  size_name?: string;
  unit_price: string;
  quantity: number;
  line_total: string;
  notes?: string;
  addons: OrderItemAddon[];
};

export type Order = {
  id: number;
  restaurant: number;
  branch: number;
  branch_name?: string;
  area?: number | null;
  customer?: number | null;
  order_type: 'delivery' | 'pickup' | 'dinein';
  status: string;
  customer_name: string;
  customer_phone: string;
  customer_city?: string;
  customer_address?: string;
  customer_landmark?: string;
  customer_instructions?: string;
  subtotal: string;
  delivery_charge: string;
  packaging_charge: string;
  discount_total: string;
  grand_total: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
};

export type CheckoutResponse = Order;

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

// ─── Fixed Deal ───────────────────────────────────────────────────────────────

export type FixedDealItem = {
  id: number;
  item: number;
  item_name: string;
  quantity: number;
  unit_price?: string;
};

export type FixedDeal = {
  id: number;
  restaurant: number;
  name: string;
  description?: string | null;
  image?: string | null;
  price: string;
  discount?: string;
  discount_type?: 'fixed' | 'percentage';
  final_price: string;
  items_detail?: FixedDealItem[];
  valid_from_date?: string | null;
  valid_to_date?: string | null;
  status: boolean;
  date_added?: string;
  date_updated?: string;
};

export type FixedDealListParams = {
  restaurant?: number;
  status?: boolean;
  page?: number;
  page_size?: number;
};

// ─── On Spot Deal ─────────────────────────────────────────────────────────────

export type OnSpotDealGroupOption = {
  id: number;
  item: number;
  item_name: string;
  quantity: number;
  unit_price?: string;
};

export type OnSpotDealGroup = {
  id: number;
  name: string;
  select_quantity: number;
  options: OnSpotDealGroupOption[];
};

export type OnSpotDeal = {
  id: number;
  restaurant: number;
  name: string;
  description?: string | null;
  image?: string | null;
  price: string;
  discount?: string;
  discount_type?: 'fixed' | 'percentage';
  final_price: string;
  items_detail?: FixedDealItem[];
  groups_detail?: OnSpotDealGroup[];
  valid_from_date?: string | null;
  valid_to_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  status: boolean;
  date_added?: string;
  date_updated?: string;
};

export type OnSpotDealListParams = {
  restaurant?: number;
  status?: boolean;
  page?: number;
  page_size?: number;
};
