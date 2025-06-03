import { useMutation, useQueryClient } from '@tanstack/react-query';

import { APIError, errorCauses, fetchAPI } from '@/api';
import { Doc } from '@/features/docs';

export type ListActiveUsersParams = {
  id: string;
}

export const listActiveUsers = async ({
  id,
}: ListActiveUsersParams): Promise<any> => {
  const response = await fetchAPI(`documents/${id}/active-users/`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new APIError('Failed to update the doc', await errorCauses(response));
  }

  return response.json() as Promise<Doc>;
};
