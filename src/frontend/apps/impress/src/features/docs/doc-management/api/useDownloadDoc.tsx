import { useMutation, useQueryClient } from '@tanstack/react-query';

import { APIError, errorCauses, fetchAPI } from '@/api';
import { Doc } from '@/features/docs';

export type UpdateDocParams = Pick<Doc, 'id'> &
  Partial<Pick<Doc, 'content' | 'title'>>;

export const downloadDoc = async ({
  id
}: UpdateDocParams): Promise<any> => {
  const response = await fetchAPI(`documents/${id}/download`, {
    method: 'GET',
  });
  console.error('Download response:', response);
  if (!response.ok) {
    throw new APIError('Failed to download the doc', await errorCauses(response));
  }
  return response;
};

