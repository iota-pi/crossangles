import { handler } from '.';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { fakeEvent } from '../lambda-shared/test/util';

describe('HTTP methods', () => {
  it('responds to OPTIONS requests with exit code 200', async () => {
    const origin = 'https://theshire.crossangles.app';
    const event: APIGatewayProxyEvent = {
      ...fakeEvent,
      httpMethod: 'OPTIONS',
      body: null,
      headers: { origin },
    };
    const result = await handler(event);
    expect(result.statusCode).toBe(200);
    expect(result.headers!['Access-Control-Allow-Origin']).toBe(origin);
    expect(result.headers!['Access-Control-Allow-Headers']).toBe('*');
  })

  it.each`
    httpMethod ${'GET'} ${'PUT'} ${'DELETE'} ${'HEAD'} ${'PATCH'} ${'CONNECT'} ${'TRACE'}
  `('gives error for $httpMethod requests', async ({ httpMethod }) => {
    const event: APIGatewayProxyEvent = {
      ...fakeEvent,
      httpMethod,
    };
    const result = await handler(event);
    expect(result.statusCode).toBe(405);
  })
})

describe('GET method responses', () => {
  it('gives error & message when no body received', async () => {
    const event = { ...fakeEvent };
    delete event.body;
    const result = await handler(event);
    expect(result.statusCode).toBe(400);
    const resultBody = JSON.parse(result.body);
    expect(resultBody.error).toBe(true);
    expect(resultBody.message).toBe('No event body received');
  })
})
