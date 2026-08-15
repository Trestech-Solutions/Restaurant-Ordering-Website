import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useEffect as reactUseEffect } from 'react';
import api from '../axios';
import API_ENDPOINTS from '../endpoint';
import { buildUrl, getCartToken, setCartToken } from '../utils';
import type {
  ApiError,
  Cart,
  CartItem as ApiCartItem,
  AddCartItemPayload,
  UpdateCartItemPayload,
} from '../types';

export { extractErrorMessage } from '../types';

export const CART_QUERY_KEY = ['storefront-cart'];

// ─── Get Cart ─────────────────────────────────────────────────────────────────

export function useGetCart(options?: {
  cartToken?: string | null;
  onSuccess?: (data: Cart) => void;
  onError?: (message: string) => void;
}) {
  const token   = options?.cartToken !== undefined ? options.cartToken : getCartToken();
  const enabled = !!token;

  const query = useQuery<Cart, ApiError>({
    queryKey: [...CART_QUERY_KEY, token],
    queryFn:  () =>
      api
        .get<Cart>(API_ENDPOINTS.StorefrontCart.getCart, { params: { cart_token: token } })
        .then((r) => {
          if (r.data?.token && r.data.token !== token) setCartToken(r.data.token);
          return r.data;
        }),
    enabled,
    staleTime: 1000 * 60 * 2,
    gcTime:    1000 * 60 * 10,
  });

  reactUseEffect(() => {
    if (query.data && options?.onSuccess) options.onSuccess(query.data);
  }, [query.data]);
  reactUseEffect(() => {
    if (query.error) options?.onError?.((query.error as ApiError)?.detail || 'Failed to load cart');
  }, [query.error]);

  return query;
}

// ─── Add to Cart ──────────────────────────────────────────────────────────────
// POST /storefront/cart/items/
// Body: { item, branch, quantity, area?, size?, notes?, addons?, cart_token? }
// Response: Cart (with token)

export function useAddToCart(options?: {
  onSuccess?: (data: Cart) => void;
  onError?: (message: string) => void;
}) {
  const queryClient = useQueryClient();

  const mutation = useMutation<Cart, ApiError, AddCartItemPayload>({
    mutationFn: async (payload) => {
      const token = payload.cart_token || getCartToken();
      const body  = { ...payload, ...(token ? { cart_token: token } : {}) };
      const r     = await api.post<Cart>(API_ENDPOINTS.StorefrontCart.addCart, body);
      if (r.data?.token) setCartToken(r.data.token);
      return r.data;
    },
    onSuccess(data) {
      toast.success('Item added to cart');
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      options?.onSuccess?.(data);
    },
    onError(err) {
      const msg = (err as ApiError)?.detail || 'Failed to add item to cart';
      toast.error(msg);
      options?.onError?.(msg);
    },
  });

  return {
    addToCart:      mutation.mutate,
    addToCartAsync: mutation.mutateAsync,
    ...mutation,
  };
}

// ─── Update Cart Item ─────────────────────────────────────────────────────────
// PATCH /storefront/cart/items/{pk}/?cart_token=<uuid>

export function useUpdateCartQuantity(options?: {
  onSuccess?: (data: ApiCartItem) => void;
  onError?: (message: string) => void;
}) {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ApiCartItem,
    ApiError,
    { cart_item_id: string | number; payload: UpdateCartItemPayload; cart_token?: string }
  >({
    mutationFn: async ({ cart_item_id, payload, cart_token }) => {
      const token = cart_token || getCartToken() || '';
      const r = await api.patch<ApiCartItem>(
        buildUrl(
          API_ENDPOINTS.StorefrontCart.updateCartItem,
          { pk: cart_item_id },
          { cart_token: token }
        ),
        payload
      );
      return r.data;
    },
    onSuccess(data) {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      options?.onSuccess?.(data);
    },
    onError(err) {
      toast.error((err as ApiError)?.detail || 'Failed to update quantity');
      options?.onError?.((err as ApiError)?.detail || 'Failed to update quantity');
    },
  });

  return {
    updateQuantity:      mutation.mutate,
    updateQuantityAsync: mutation.mutateAsync,
    ...mutation,
  };
}

// ─── Remove Cart Item ─────────────────────────────────────────────────────────
// DELETE /storefront/cart/items/{pk}/?cart_token=<uuid>

export function useRemoveCartItem(options?: {
  onSuccess?: () => void;
  onError?: (message: string) => void;
}) {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    void,
    ApiError,
    { cart_item_id: string | number; cart_token?: string }
  >({
    mutationFn: async ({ cart_item_id, cart_token }) => {
      const token = cart_token || getCartToken() || '';
      await api.delete(
        buildUrl(
          API_ENDPOINTS.StorefrontCart.removeCartItem,
          { pk: cart_item_id },
          { cart_token: token }
        )
      );
    },
    onSuccess() {
      toast.success('Item removed from cart');
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      options?.onSuccess?.();
    },
    onError(err) {
      toast.error((err as ApiError)?.detail || 'Failed to remove item');
      options?.onError?.((err as ApiError)?.detail || 'Failed to remove item');
    },
  });

  return {
    removeItem:      mutation.mutate,
    removeItemAsync: mutation.mutateAsync,
    ...mutation,
  };
}
