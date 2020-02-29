import { APIGatewayEvent, Context, APIGatewayProxyResult } from 'aws-lambda';
import sendMail from './sendMail';
import { parseBody } from './parseBody';
import { getResponse } from './getResponse';

export const MAX_BODY_LENGTH = 10000;

export const handler = async (event: APIGatewayEvent, context?: Context): Promise<APIGatewayProxyResult> => {
  const method = event.httpMethod.toUpperCase();
  switch (method) {
    case 'OPTIONS':
      return handleOptions(event);
    case 'POST':
      return handlePost(event);
  }

  return getResponse({
    statusCode: 405,
    message: `Got unexpected HTTP method "${event.httpMethod}"`,
  });
}

const handleOptions = async (event: APIGatewayEvent) => {
  return getResponse({
    headers: { 'Access-Control-Allow-Headers': '*' },
  });
}

const handlePost = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return getResponse({
      statusCode: 400,
      message: 'No event body received',
    });
  }

  if (event.body.length > MAX_BODY_LENGTH) {
    return getResponse({
      statusCode: 400,
      message: `Event body too long. (${event.body.length} > ${MAX_BODY_LENGTH})`,
    });
  }

  const body = parseBody(event);
  if (body === null) {
    return getResponse({
      statusCode: 400,
      message: 'Invalid body data received',
    });
  }

  await sendMail(body);

  return getResponse({
    message: 'Thanks, your message has been received.',
  });
}
