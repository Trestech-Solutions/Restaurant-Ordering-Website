import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../axios';
import API_ENDPOINTS from '../endpoint';

type ApiError = {
  detail?: string;
  [key: string]: unknown;
};

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object') {
    const e = err as ApiError;
    if (typeof e.detail === 'string') return e.detail;
    const firstField = Object.values(e)[0];
    if (Array.isArray(firstField)) return firstField[0] as string;
  }
  return 'Something went wrong. Please try again.';
}

export type LoginPayload = {
  username: string;
  password: string;
};

export type LoginResponse = {
  access: string;
  refresh: string;
  user: {
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
};

export type ForgotPasswordPayload = { email: string };

export type ResetPasswordPayload = {
  uid: string;
  token: string;
  new_password: string;
};

export function useLogin(options?: {
  onSuccess?: (data: LoginResponse) => void;
  onError?: (message: string) => void;
}) {
  const mutation = useMutation<LoginResponse, ApiError, LoginPayload>({
    mutationFn: (payload) =>
      api
        .post<LoginResponse>(API_ENDPOINTS.StorefrontCustomerAuth.login, payload)
        .then((r) => r.data),

    onSuccess(data) {
      toast.success('Logged in successfully.');
      options?.onSuccess?.(data);
    },
    onError(err) {
      const message = extractErrorMessage(err);
      toast.error(message);
      options?.onError?.(message);
    },
  });

  return {
    login: mutation.mutate,
    loginAsync: mutation.mutateAsync,
    ...mutation,
  };
}

export function useRefreshToken(options?: {
  onSuccess?: (data: { access: string; refresh?: string }) => void;
  onError?: (message: string) => void;
}) {
  const mutation = useMutation<
    { access: string; refresh?: string },
    ApiError,
    { refresh: string }
  >({
    mutationFn: (payload) =>
      api
        .post<{ access: string; refresh?: string }>(
          API_ENDPOINTS.StorefrontCustomerAuth.refreshToken,
          payload
        )
        .then((r) => r.data),

    onSuccess(data) {
      options?.onSuccess?.(data);
    },
    onError(err) {
      const message = extractErrorMessage(err);
      options?.onError?.(message);
    },
  });

  return {
    refreshToken: mutation.mutate,
    refreshTokenAsync: mutation.mutateAsync,
    ...mutation,
  };
}

export function useLogout(options?: {
  onSuccess?: () => void;
  onError?: (message: string) => void;
}) {
  const mutation = useMutation<void, ApiError, { refresh: string }>({
    mutationFn: async (payload) => {
      try {
        await api.post('/storefront/logout/', payload).then(() => undefined);
      } catch {
        // Silently ignore — tokens are cleared on the client anyway
      }
      return undefined;
    },

    onSuccess() {
      toast.success('Logged out successfully.');
      options?.onSuccess?.();
    },
    onError(err) {
      const message = extractErrorMessage(err);
      toast.error(message);
      options?.onError?.(message);
    },
  });

  return {
    logout: mutation.mutate,
    logoutAsync: mutation.mutateAsync,
    ...mutation,
  };
}

export function useForgotPassword(options?: {
  onSuccess?: (data: { detail: string }) => void;
  onError?: (message: string) => void;
}) {
  const mutation = useMutation<{ detail: string }, ApiError, ForgotPasswordPayload>({
    mutationFn: (payload) =>
      api
        .post<{ detail: string }>('/storefront/password/reset/', payload)
        .then((r) => r.data),

    onSuccess(data) {
      toast.success(data.detail);
      options?.onSuccess?.(data);
    },
    onError(err) {
      const message = extractErrorMessage(err);
      toast.error(message);
      options?.onError?.(message);
    },
  });

  return {
    forgotPassword: mutation.mutate,
    forgotPasswordAsync: mutation.mutateAsync,
    ...mutation,
  };
}

export function useResetPassword(options?: {
  onSuccess?: (data: { detail: string }) => void;
  onError?: (message: string) => void;
}) {
  const mutation = useMutation<{ detail: string }, ApiError, ResetPasswordPayload>({
    mutationFn: (payload) =>
      api
        .post<{ detail: string }>('/storefront/password/reset/confirm/', payload)
        .then((r) => r.data),

    onSuccess(data) {
      toast.success(data.detail ?? 'Password reset successfully.');
      options?.onSuccess?.(data);
    },
    onError(err) {
      const message = extractErrorMessage(err);
      toast.error(message);
      options?.onError?.(message);
    },
  });

  return {
    resetPassword: mutation.mutate,
    resetPasswordAsync: mutation.mutateAsync,
    ...mutation,
  };
}
