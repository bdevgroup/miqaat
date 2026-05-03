import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { CustomReciter } from '@/types';

const KEY = ['custom-reciters'] as const;

export function useCustomReciters() {
  return useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<CustomReciter[]> => {
      const { data } = await api.get<CustomReciter[]>('/custom-reciters');
      return data;
    },
    staleTime: 60_000,
  });
}

export function useUploadCustomReciter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      file, name, durationMs,
    }: { file: File; name: string; durationMs?: number }) => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('name', name);
      if (durationMs != null) fd.append('durationMs', String(durationMs));
      const { data } = await api.post<CustomReciter>(
        '/custom-reciters',
        fd,
        // Multer needs the multipart boundary axios sets automatically
        // when we hand it a FormData; explicit Content-Type would break
        // boundary detection.
        { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60_000 },
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useRenameCustomReciter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const { data } = await api.patch<CustomReciter>(`/custom-reciters/${id}`, { name });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteCustomReciter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/custom-reciters/${id}`);
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

/** Tell the server about the duration we measured locally after upload. */
export function useSetCustomReciterDuration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, durationMs }: { id: number; durationMs: number }) => {
      const { data } = await api.patch<CustomReciter>(
        `/custom-reciters/${id}/duration`,
        { durationMs },
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
