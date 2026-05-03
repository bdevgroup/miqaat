import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { SavedLocation, CitySearchResult } from '@/types';

export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async (): Promise<SavedLocation[]> => {
      const { data } = await api.get<SavedLocation[]>('/locations');
      return data;
    },
    staleTime: Infinity,
  });
}

export function useCurrentLocation() {
  return useQuery({
    queryKey: ['location', 'current'],
    queryFn: async (): Promise<SavedLocation | null> => {
      const { data } = await api.get<SavedLocation | null>('/locations/current');
      return data;
    },
    staleTime: Infinity,
  });
}

export function useCitySearch(q: string) {
  return useQuery({
    queryKey: ['city-search', q],
    queryFn: async (): Promise<CitySearchResult[]> => {
      const { data } = await api.get<CitySearchResult[]>('/locations/search', {
        params: { q },
      });
      return data;
    },
    enabled: q.trim().length >= 2,
    staleTime: 60 * 60_000,
  });
}

export function useSaveLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (loc: {
      name: string;
      city: string;
      country: string;
      lat: number;
      lng: number;
      timezone?: string;
      makeCurrent?: boolean;
    }) => {
      const { data } = await api.post<SavedLocation>('/locations', loc);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations'] });
      qc.invalidateQueries({ queryKey: ['location', 'current'] });
      qc.invalidateQueries({ queryKey: ['prayer-times'] });
    },
  });
}

export function useSetCurrentLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.put<SavedLocation>(`/locations/${id}/current`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations'] });
      qc.invalidateQueries({ queryKey: ['location', 'current'] });
      qc.invalidateQueries({ queryKey: ['prayer-times'] });
    },
  });
}

export function useDeleteLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/locations/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations'] });
      qc.invalidateQueries({ queryKey: ['location', 'current'] });
    },
  });
}
