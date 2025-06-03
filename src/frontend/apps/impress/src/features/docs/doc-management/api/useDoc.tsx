import { UseQueryOptions, useQuery } from '@tanstack/react-query';

import { APIError, errorCauses, fetchAPI } from '@/api';

import { Doc } from '../types';

export type DocParams = {
  id: string;
  revision?: number; // Optional revision for indicating to the backend which version the frontend uses
};

export const getDoc = async ({ id, revision }: DocParams): Promise<Doc> => {
  const url = revision
    ? `documents/${id}/?revision=${revision}`
    : `documents/${id}/`;
  const response = await fetchAPI(url);

  if (!response.ok) {
    throw new APIError('Failed to get the doc', await errorCauses(response));
  }

  return response.json() as Promise<Doc>;
};

export const KEY_DOC = 'doc';
export const KEY_DOC_VISIBILITY = 'doc-visibility';

export function useDoc(
  params: DocParams,
  options?: Omit<
    UseQueryOptions<Doc, APIError<unknown>, Doc>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<Doc, APIError, Doc>({
    queryKey: [KEY_DOC, params],
    queryFn: () => getDoc(params),
    ...options,
  });
}
