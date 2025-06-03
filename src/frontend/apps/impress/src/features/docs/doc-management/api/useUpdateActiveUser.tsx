import { useMutation, useQueryClient } from '@tanstack/react-query';

import { APIError, errorCauses, fetchAPI } from '@/api';
import { Doc } from '@/features/docs';

export type UpdateActiveUserParams = {
  id: string;
  user_email: string;
  sheet_index: number;
  row_index: number;
  column_index: number;
}

export const updateActiveUser = async ({
  id,
  ...params
}: UpdateActiveUserParams): Promise<Doc> => {
  const response = await fetchAPI(`documents/${id}/active-user/`, {
    method: 'POST',
    body: JSON.stringify({
      ...params,
    }),
  });

  if (!response.ok) {
    throw new APIError('Failed to update the doc', await errorCauses(response));
  }

  return response.json() as Promise<Doc>;
};
