import sendMail from './sendMail';

const MAX_LENGTH = 10000;

export const handler = async (event: any = {}, context: any) => {
  if (!event.body) {
    throw new Error(`No event body received`);
  }

  if (event.body.length > MAX_LENGTH) {
    throw new Error(`Event body too long. (${event.body.length} > ${MAX_LENGTH})`);
  }

  let body: { email?: string, message?: string, name?: string };
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    throw new Error('Could not parse body as JSON');
  }

  if (body && body.email && body.message && body.name) {
    const promise = sendMail({ email: body.email, message: body.message, name: body.name });

    return promise;
  } else {
    throw new Error(`Invalid request body received`);
  }
}
