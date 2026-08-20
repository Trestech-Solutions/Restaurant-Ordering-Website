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
  LocateResponse,
} from '../types';
import { useEffect as reactUseEffect } from 'react';

export { extractErrorMessage } from '../types';

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
          API_ENDPOINTS.StorefrontBrowse.getBranches,
          { params: { restaurant: restaurantId } }
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

export function useGetAreas(options?: {
  restaurantId?: string | number;
  branchId?: string | number;
  onSuccess?: (data: Area[]) => void;
  onError?: (message: string) => void;
}) {
  const restaurantId = options?.restaurantId ?? getRestaurantId();

  const query = useQuery<Area[], ApiError>({
    queryKey: ['storefront-areas', restaurantId, options?.branchId],
    queryFn: () => {
      const params: Record<string, string | number> = { restaurant: restaurantId }
      if (options?.branchId) params.branch = options.branchId
      return api
        .get<{ results?: Area[] } | Area[]>(
          API_ENDPOINTS.StorefrontBrowse.getAreas,
          { params }
        )
        .then((r) => {
          const data = r.data as { results?: Area[] } | Area[];
          return Array.isArray(data) ? data : data.results ?? [];
        })
    },
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

export function useGetMenu(params: {
  branchId: string | number | null;
  areaId?: string | number | null;
  onSuccess?: (data: MenuResponse) => void;
  onError?: (message: string) => void;
}) {
  const enabled = params.branchId !== null && params.branchId !== undefined;

  const query = useQuery<MenuResponse, ApiError>({
    queryKey: ['storefront-menu', params.branchId, params.areaId],
    queryFn: () => {
      const queryParams: Record<string, string | number> = {
        branch: params.branchId as string | number,
      }
      if (params.areaId !== null && params.areaId !== undefined) {
        queryParams.area = params.areaId as string | number
      }
      return api
        .get<MenuResponse>(API_ENDPOINTS.StorefrontBrowse.getMenu, { params: queryParams })
        .then((r) => {
          const data = r.data
          // Normalise: API returns `menu`, older versions return `categories`
          if (!data.menu && (data as any).categories) {
            data.menu = (data as any).categories
          }
          if (!data.menu) data.menu = []
          return data
        })
    },
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

export async function locate(
  lat: number,
  lng: number,
  options?: { restaurantId?: string | number }
): Promise<LocateResponse> {
  const restaurantId = options?.restaurantId ?? getRestaurantId();
  const params: Record<string, string | number> = { lat, lng };
  if (restaurantId) params.restaurant = restaurantId;
  const r = await api.get<LocateResponse>(API_ENDPOINTS.StorefrontBrowse.locate, { params });
  return r.data;
}
