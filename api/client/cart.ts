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
  const token = options?.cartToken !== undefined ? options.cartToken : getCartToken();
  const enabled = !!token;

  const query = useQuery<Cart, ApiError>({
    queryKey: [...CART_QUERY_KEY, token],
    queryFn: () =>
      api
        .get<Cart>(
          buildUrl(API_ENDPOINTS.StorefrontCart.getCart, {
            cart_token: token as string,
          })
        )
        .then((r) => {
          if (r.data?.token && r.data.token !== token) {
            setCartToken(r.data.token);
          }
          return r.data;
        }),
    enabled,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });

  reactUseEffect(() => {
    if (query.data && options?.onSuccess) options.onSuccess(query.data);
  }, [query.data]);

  reactUseEffect(() => {
    if (query.error) {
      const msg = (query.error as ApiError)?.detail || 'Failed to load cart';
      options?.onError?.(msg);
    }
  }, [query.error]);

  return query;
}

// ─── Add to Cart ──────────────────────────────────────────────────────────────

export function useAddToCart(options?: {
  onSuccess?: (data: ApiCartItem | Cart) => void;
  onError?: (message: string) => void;
}) {
  const queryClient = useQueryClient();

  const mutation = useMutation<ApiCartItem | Cart, ApiError, AddCartItemPayload>({
    mutationFn: (payload) => {
      const token = payload.cart_token || getCartToken();
      const body: AddCartItemPayload = { ...payload };
      if (token) body.cart_token = token;
      return api
        .post<ApiCartItem | Cart>(API_ENDPOINTS.StorefrontCart.addCart, body)
        .then((r) => {
          const data = r.data;
          const maybeCart = data as Cart;
          const maybeItem = data as ApiCartItem;
          if (maybeCart.token) setCartToken(maybeCart.token);
          const itemCart = maybeItem.cart ? (maybeItem as ApiCartItem & { cart_token?: string }) : undefined;
          if (itemCart && (itemCart as any).cart_token) {
            setCartToken((itemCart as any).cart_token);
          }
          return data;
        });
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
    addToCart: mutation.mutate,
    addToCartAsync: mutation.mutateAsync,
    ...mutation,
  };
}

// ─── Add Another Item to Same Cart ────────────────────────────────────────────

export function useAddAnotherItem(options?: {
  onSuccess?: (data: ApiCartItem) => void;
  onError?: (message: string) => void;
}) {
  const queryClient = useQueryClient();

  const mutation = useMutation<ApiCartItem, ApiError, AddCartItemPayload>({
    mutationFn: (payload) =>
      api
        .post<ApiCartItem>(API_ENDPOINTS.StorefrontCart.addAnotherItemToSameCart, payload)
        .then((r) => r.data),
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
    addAnotherItem: mutation.mutate,
    addAnotherItemAsync: mutation.mutateAsync,
    ...mutation,
  };
}

// ─── Update Cart Quantity ─────────────────────────────────────────────────────

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
    mutationFn: ({ cart_item_id, payload, cart_token }) => {
      const token = cart_token || getCartToken() || '';
      return api
        .patch<ApiCartItem>(
          buildUrl(
            API_ENDPOINTS.StorefrontCart.updateCartQuantity,
            { cart_item_id },
            { cart_token: token }
          ),
          payload
        )
        .then((r) => r.data);
    },
    onSuccess(data) {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      options?.onSuccess?.(data);
    },
    onError(err) {
      const msg = (err as ApiError)?.detail || 'Failed to update quantity';
      toast.error(msg);
      options?.onError?.(msg);
    },
  });

  return {
    updateQuantity: mutation.mutate,
    updateQuantityAsync: mutation.mutateAsync,
    ...mutation,
  };
}

// ─── Remove Cart Item ─────────────────────────────────────────────────────────

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
    mutationFn: ({ cart_item_id, cart_token }) => {
      const token = cart_token || getCartToken() || '';
      return api
        .delete(
          buildUrl(
            API_ENDPOINTS.StorefrontCart.removeCartItem,
            { cart_item_id },
            { cart_token: token }
          )
        )
        .then(() => undefined);
    },
    onSuccess() {
      toast.success('Item removed from cart');
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      options?.onSuccess?.();
    },
    onError(err) {
      const msg = (err as ApiError)?.detail || 'Failed to remove item';
      toast.error(msg);
      options?.onError?.(msg);
    },
  });

  return {
    removeItem: mutation.mutate,
    removeItemAsync: mutation.mutateAsync,
    ...mutation,
  };
}
