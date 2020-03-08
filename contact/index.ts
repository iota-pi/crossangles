import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';
import { LambdaResponder } from '../lambda-shared/LambdaResponder';
import sendMail from './sendMail';
import { parseBody } from './parseBody';

export const MAX_BODY_LENGTH = 10000;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const responder = new LambdaResponder(event);
  const method = event.httpMethod.toUpperCase();

  switch (method) {
    case 'OPTIONS':
      return responder.getResponse({
        headers: { 'Access-Control-Allow-Headers': '*' },
      });
    case 'POST':
      return handlePost(event, responder);
  }

  return responder.getResponse({
    statusCode: 405,
    message: `Got unexpected HTTP method "${event.httpMethod}"`,
  });
}

const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;

const handlePost = async (event: APIGatewayProxyEvent, responder: LambdaResponder) => {
  if (!event.body) {
    return responder.getResponse({
      statusCode: 400,
      message: 'No event body received',
    });
  }

  if (event.body.length > MAX_BODY_LENGTH) {
    return responder.getResponse({
      statusCode: 400,
      message: `Event body too long. (${event.body.length} > ${MAX_BODY_LENGTH})`,
    });
  }

  const body = parseBody(event);
  if (body === null) {
    return responder.getResponse({
      statusCode: 400,
      message: 'Invalid body data received',
    });
  }

  if (!emailRegex.test(body.email)) {
    return responder.getResponse({
      statusCode: 400,
      message: `Invalid email address, received: "${body.email}"`,
    });
  }

  await sendMail(body);

  return responder.getResponse({
    message: 'Thanks, your message has been received',
  });
}
