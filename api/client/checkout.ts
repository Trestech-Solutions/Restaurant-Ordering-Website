import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useEffect as reactUseEffect } from 'react';
import api from '../axios';
import API_ENDPOINTS from '../endpoint';
import { buildUrl, getCartToken } from '../utils';
import type {
  ApiError,
  GuestCheckoutPayload,
  LoggedInCheckoutPayload,
  CheckoutResponse,
  Order,
} from '../types';

export { extractErrorMessage } from '../types';

// ─── Checkout (Guest) ─────────────────────────────────────────────────────────

export function useCheckoutGuest(options?: {
  onSuccess?: (data: CheckoutResponse) => void;
  onError?: (message: string) => void;
}) {
  const mutation = useMutation<CheckoutResponse, ApiError, GuestCheckoutPayload>({
    mutationFn: (payload) =>
      api
        .post<CheckoutResponse>(API_ENDPOINTS.StorefrontCheckout.checkoutGuest, payload)
        .then((r) => r.data),
    onSuccess(data) {
      toast.success(data.message || 'Order placed successfully');
      options?.onSuccess?.(data);
    },
    onError(err) {
      const msg = (err as ApiError)?.detail || 'Failed to place order';
      toast.error(msg);
      options?.onError?.(msg);
    },
  });

  return {
    checkoutGuest: mutation.mutate,
    checkoutGuestAsync: mutation.mutateAsync,
    ...mutation,
  };
}

// ─── Checkout (Logged In Customer) ────────────────────────────────────────────

export function useCheckoutLoggedIn(options?: {
  onSuccess?: (data: CheckoutResponse) => void;
  onError?: (message: string) => void;
}) {
  const mutation = useMutation<CheckoutResponse, ApiError, LoggedInCheckoutPayload>({
    mutationFn: (payload) =>
      api
        .post<CheckoutResponse>(
          API_ENDPOINTS.StorefrontCheckout.checkoutLoggedInCustomer,
          payload
        )
        .then((r) => r.data),
    onSuccess(data) {
      toast.success(data.message || 'Order placed successfully');
      options?.onSuccess?.(data);
    },
    onError(err) {
      const msg = (err as ApiError)?.detail || 'Failed to place order';
      toast.error(msg);
      options?.onError?.(msg);
    },
  });

  return {
    checkoutLoggedIn: mutation.mutate,
    checkoutLoggedInAsync: mutation.mutateAsync,
    ...mutation,
  };
}

// ─── Helper: Build checkout payloads from local state ─────────────────────────

export function buildGuestPayload(params: {
  title?: string;
  first_name: string;
  last_name?: string;
  phone: string;
  alt_phone?: string;
  email?: string;
  address?: string;
  landmark?: string;
  city?: string;
  order_type: 'delivery' | 'pickup';
  payment_method: 'cod' | 'card' | 'online' | 'wallet';
  branch?: number;
  area?: number;
  subtotal: number;
  tax: number;
  delivery_fee: number;
  discount?: number;
  total: number;
  special_instructions?: string;
  voucher_code?: string;
  change_amount?: string | number;
  is_gift?: boolean;
}): GuestCheckoutPayload {
  const cart_token = getCartToken() || '';
  return {
    customer_type: 'guest',
    cart_token,
    title: params.title,
    first_name: params.first_name,
    last_name: params.last_name,
    phone: params.phone,
    alt_phone: params.alt_phone,
    email: params.email,
    address: params.address,
    landmark: params.landmark,
    city: params.city,
    order_type: params.order_type,
    payment_method: params.payment_method,
    branch: params.branch,
    area: params.area,
    subtotal: params.subtotal,
    tax: params.tax,
    delivery_fee: params.delivery_fee,
    discount: params.discount ?? 0,
    total: params.total,
    special_instructions: params.special_instructions,
    voucher_code: params.voucher_code,
    change_amount: params.change_amount,
    is_gift: params.is_gift,
  };
}

export function buildLoggedInPayload(params: {
  address_id?: number;
  address?: string;
  city?: string;
  customer_name?: string;
  customer_phone?: string;
  order_type: 'delivery' | 'pickup';
  payment_method: 'cod' | 'card' | 'online' | 'wallet';
  branch?: number;
  area?: number;
  subtotal: number;
  tax: number;
  delivery_fee: number;
  discount?: number;
  total: number;
  special_instructions?: string;
  voucher_code?: string;
  change_amount?: string | number;
  is_gift?: boolean;
}): LoggedInCheckoutPayload {
  const cart_token = getCartToken() || '';
  return {
    customer_type: 'logged_in',
    cart_token,
    address_id: params.address_id,
    address: params.address,
    city: params.city,
    customer_name: params.customer_name,
    customer_phone: params.customer_phone,
    order_type: params.order_type,
    payment_method: params.payment_method,
    branch: params.branch,
    area: params.area,
    subtotal: params.subtotal,
    tax: params.tax,
    delivery_fee: params.delivery_fee,
    discount: params.discount ?? 0,
    total: params.total,
    special_instructions: params.special_instructions,
    voucher_code: params.voucher_code,
    change_amount: params.change_amount,
    is_gift: params.is_gift,
  };
}

// ─── Get Order ────────────────────────────────────────────────────────────────

export function useGetOrder(params: {
  orderId: string | number | null;
  onSuccess?: (data: Order) => void;
  onError?: (message: string) => void;
}) {
  const enabled = params.orderId !== null;

  const query = useQuery<Order, ApiError>({
    queryKey: ['storefront-order', params.orderId],
    queryFn: () =>
      api
        .get<Order>(
          buildUrl(API_ENDPOINTS.StorefrontCheckout.getOrder, {
            order_id: params.orderId as string | number,
          })
        )
        .then((r) => r.data),
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  reactUseEffect(() => {
    if (query.data && params.onSuccess) params.onSuccess(query.data);
  }, [query.data]);

  reactUseEffect(() => {
    if (query.error) {
      const msg = (query.error as ApiError)?.detail || 'Failed to load order';
      toast.error(msg);
      params.onError?.(msg);
    }
  }, [query.error]);

  return query;
}
