import { APIGatewayEvent, APIGatewayEventRequestContext } from 'aws-lambda';

export const fakeEvent: APIGatewayEvent = {
  body: '',
  headers: {},
  multiValueHeaders: {},
  isBase64Encoded: false,
  path: '',
  httpMethod: 'POST',
  queryStringParameters: {},
  multiValueQueryStringParameters: {},
  pathParameters: {},
  requestContext: {} as APIGatewayEventRequestContext,
  resource: '',
  stageVariables: {},
}
