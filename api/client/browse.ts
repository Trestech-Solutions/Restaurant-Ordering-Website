import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../axios';
import API_ENDPOINTS from '../endpoint';
import { buildUrl, getRestaurantId } from '../utils';
import type {
  ApiError,
  Branch,
  Area,
  MenuResponse,
} from '../types';
import { useEffect as reactUseEffect } from 'react';

export { extractErrorMessage } from '../types';

// ─── Get Branches ─────────────────────────────────────────────────────────────

export function useGetBranches(options?: {
  restaurantId?: string | number;
  onSuccess?: (data: Branch[]) => void;
  onError?: (message: string) => void;
}) {
  const restaurantId = options?.restaurantId ?? getRestaurantId();

  const query = useQuery<Branch[], ApiError>({
    queryKey: ['storefront-branches', restaurantId],
    queryFn: () =>
      api
        .get<{ results?: Branch[] } | Branch[]>(
          buildUrl(API_ENDPOINTS.StorefrontBrowse.getBranches, {
            restaurant_id: restaurantId,
          })
        )
        .then((r) => {
          const data = r.data as { results?: Branch[] } | Branch[];
          return Array.isArray(data) ? data : data.results ?? [];
        }),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });

  reactUseEffect(() => {
    if (query.data && options?.onSuccess) options.onSuccess(query.data);
  }, [query.data]);

  reactUseEffect(() => {
    if (query.error) {
      const msg = (query.error as ApiError)?.detail || 'Failed to load branches';
      toast.error(msg);
      options?.onError?.(msg);
    }
  }, [query.error]);

  return query;
}

// ─── Get Areas ────────────────────────────────────────────────────────────────

export function useGetAreas(options?: {
  restaurantId?: string | number;
  onSuccess?: (data: Area[]) => void;
  onError?: (message: string) => void;
}) {
  const restaurantId = options?.restaurantId ?? getRestaurantId();

  const query = useQuery<Area[], ApiError>({
    queryKey: ['storefront-areas', restaurantId],
    queryFn: () =>
      api
        .get<{ results?: Area[] } | Area[]>(
          buildUrl(API_ENDPOINTS.StorefrontBrowse.getAreas, {
            restaurant_id: restaurantId,
          })
        )
        .then((r) => {
          const data = r.data as { results?: Area[] } | Area[];
          return Array.isArray(data) ? data : data.results ?? [];
        }),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });

  reactUseEffect(() => {
    if (query.data && options?.onSuccess) options.onSuccess(query.data);
  }, [query.data]);

  reactUseEffect(() => {
    if (query.error) {
      const msg = (query.error as ApiError)?.detail || 'Failed to load delivery areas';
      toast.error(msg);
      options?.onError?.(msg);
    }
  }, [query.error]);

  return query;
}

// ─── Get Menu ─────────────────────────────────────────────────────────────────

export function useGetMenu(params: {
  branchId: string | number | null;
  areaId: string | number | null;
  onSuccess?: (data: MenuResponse) => void;
  onError?: (message: string) => void;
}) {
  const enabled = params.branchId !== null && params.areaId !== null;

  const query = useQuery<MenuResponse, ApiError>({
    queryKey: ['storefront-menu', params.branchId, params.areaId],
    queryFn: () =>
      api
        .get<MenuResponse>(
          buildUrl(API_ENDPOINTS.StorefrontBrowse.getMenu, {
            branch_id: params.branchId as string | number,
            area_id: params.areaId as string | number,
          })
        )
        .then((r) => r.data),
    enabled,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });

  reactUseEffect(() => {
    if (query.data && params.onSuccess) params.onSuccess(query.data);
  }, [query.data]);

  reactUseEffect(() => {
    if (query.error) {
      const msg = (query.error as ApiError)?.detail || 'Failed to load menu';
      toast.error(msg);
      params.onError?.(msg);
    }
  }, [query.error]);

  return query;
}
