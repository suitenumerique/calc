import { APIError, errorCauses, fetchAPI } from '@/api';


export const upload = async ({
  id,
  input
}: any): Promise<any> => {

  const formData = new FormData();
  formData.append('file', input.files[0]);

  console.log(input.files[0])
  const response = await fetchAPI(`documents/${id}/upload/`, {
    method: 'POST',
    body: formData,
    withoutContentType: true,
  });
  if (!response.ok) {
    throw new APIError('Failed to upload the doc', await errorCauses(response));
  }
  return response;
};
