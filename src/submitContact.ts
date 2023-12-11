import axios from 'axios';

export async function submitContact({ name, email, message }: {
  name: string,
  email: string,
  message: string,
}) {
  const url = `${import.meta.env.VITE_CONTACT_ENDPOINT}/${import.meta.env.VITE_STAGE_NAME}/`;

  const response = await axios.post(url, {
    email,
    name,
    message,
  }).catch(e => console.error(e));

  return response;
}

export default submitContact;
