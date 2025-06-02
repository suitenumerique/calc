import { useMutation, useQueryClient } from '@tanstack/react-query';

import { APIError, errorCauses, fetchAPI } from '@/api';
import { Doc } from '@/features/docs';

export type UpdateDocParams = Pick<Doc, 'id'> &
  Partial<Pick<Doc, 'content' | 'title'>>;

export const downloadDoc = async ({
  id
}: UpdateDocParams): Promise<Doc> => {
  const response = await fetchAPI(`documents/${id}/download`, {
    method: 'GET',
  });
  console.error('Download response:', response);
  if (!response.ok) {
    throw new APIError('Failed to download the doc', await errorCauses(response));
  }
  return response.body;
};

interface UpdateDocProps {
  onSuccess?: (data: Doc) => void;
  listInvalideQueries?: string[];
}

export function useUpdateDoc({
  onSuccess,
  listInvalideQueries,
}: UpdateDocProps = {}) {
  const queryClient = useQueryClient();
  return useMutation<Doc, APIError, UpdateDocParams>({
    mutationFn: updateDoc,
    onSuccess: (data) => {
      listInvalideQueries?.forEach((queryKey) => {
        void queryClient.invalidateQueries({
          queryKey: [queryKey],
        });
      });
      onSuccess?.(data);
    },
  });
}
