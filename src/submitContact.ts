import axios from 'axios';

export const submitContact = async ({ name, email, message }: {
  name: string,
  email: string,
  message: string,
}) => {
  const url = process.env.REACT_APP_CONTACT_ENDPOINT;
  if (!url) {
    throw new Error('No submission endpoint provided for contact us form');
  }

  const response = await axios.post(url, {
    email,
    name,
    message,
  }).catch(e => console.error(e));

  return response;
}