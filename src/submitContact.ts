import axios from 'axios';
import env from './env';

export async function submitContact({ name, email, message }: {
  name: string,
  email: string,
  message: string,
}) {
  const url = env.contactURI;

  const response = await axios.post(url, {
    email,
    name,
    message,
  }).catch(e => console.error(e));

  return response;
}

export default submitContact;
