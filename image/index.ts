import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';
import { LambdaResponder } from '../lambda-shared/LambdaResponder';

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

const handlePost = async (event: APIGatewayProxyEvent, responder: LambdaResponder) => {
  if (!event.body) {
    return responder.getResponse({
      statusCode: 400,
      message: 'No event body received',
    });
  }

  return responder.getResponse({
    message: 'Thanks, your message has been received',
  });
}
