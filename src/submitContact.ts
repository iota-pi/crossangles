import axios from 'axios';

export async function submitContact({ name, email, message }: {
  name: string,
  email: string,
  message: string,
}) {
  const url = `${process.env.REACT_APP_CONTACT_ENDPOINT}/${process.env.REACT_APP_STAGE_NAME}/`;

  const response = await axios.post(url, {
    email,
    name,
    message,
  }).catch(e => console.error(e));

  return response;
}
