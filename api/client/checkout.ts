import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../axios';
import API_ENDPOINTS from '../endpoint';
import { getCartToken } from '../utils';
import type {
  ApiError,
  CheckoutPayload,
  CheckoutResponse,
} from '../types';

export { extractErrorMessage } from '../types';

// ─── Checkout ─────────────────────────────────────────────────────────────────
// POST /api/storefront/checkout/
// Body: { cart_token, order_type, customer_name, customer_phone,
//         customer_city?, customer_address?, customer_landmark?,
//         customer_instructions? }
// Response: Order object (same as OrderSerializer)

export function useCheckout(options?: {
  onSuccess?: (data: CheckoutResponse) => void;
  onError?: (message: string) => void;
}) {
  const mutation = useMutation<CheckoutResponse, ApiError, CheckoutPayload>({
    mutationFn: (payload) =>
      api
        .post<CheckoutResponse>(
          API_ENDPOINTS.StorefrontCheckout.checkout,
          payload
        )
        .then((r) => r.data),
    onSuccess(data) {
      toast.success('Order placed successfully!');
      options?.onSuccess?.(data);
    },
    onError(err) {
      const e = err as ApiError;
      const msg =
        e.detail ||
        (Array.isArray(Object.values(e)[0])
          ? (Object.values(e)[0] as string[])[0]
          : 'Failed to place order. Please try again.');
      toast.error(msg);
      options?.onError?.(msg);
    },
  });

  return {
    checkout:      mutation.mutate,
    checkoutAsync: mutation.mutateAsync,
    ...mutation,
  };
}

// ─── Build checkout payload ───────────────────────────────────────────────────

export function buildCheckoutPayload(params: {
  order_type: 'delivery' | 'pickup' | 'dinein';
  customer_name: string;
  customer_phone: string;
  customer_city?: string;
  customer_address?: string;
  customer_landmark?: string;
  customer_instructions?: string;
  cart_token?: string;
}): CheckoutPayload {
  return {
    cart_token:             params.cart_token || getCartToken() || '',
    order_type:             params.order_type,
    customer_name:          params.customer_name,
    customer_phone:         params.customer_phone,
    customer_city:          params.customer_city,
    customer_address:       params.customer_address,
    customer_landmark:      params.customer_landmark,
    customer_instructions:  params.customer_instructions,
  };
}

// ─── Legacy compat exports (avoid breaking imports elsewhere) ─────────────────
export const useCheckoutGuest      = useCheckout;
export const useCheckoutLoggedIn   = useCheckout;
export const buildGuestPayload     = buildCheckoutPayload;
export const buildLoggedInPayload  = buildCheckoutPayload;

// ─── useGetOrder stub (no order detail endpoint in current backend) ────────────
export function useGetOrder(_params: { orderId: string | number | null }): {
  data: Record<string, unknown> | undefined;
  isLoading: boolean;
  error: null;
} {
  return { data: undefined, isLoading: false, error: null };
}
