import { handler, MAX_BODY_LENGTH } from '.';
import { sendMail } from './sendMail';
import { parseBody, RequestBody } from './parseBody';
import { fakeEvent } from './test/util';
import Mailgun = require('mailgun-js');
import { APIGatewayProxyEvent } from 'aws-lambda';

jest.mock('./parseBody');
const mock_parseWriter = <jest.Mock<RequestBody | null>>parseBody;
jest.mock('./sendMail');
const mock_sendMail = <jest.Mock<Promise<Mailgun.messages.SendResponse>>>sendMail;


describe('HTTP methods', () => {
  it('responds to OPTIONS requests with exit code 200', async () => {
    const event: APIGatewayProxyEvent = {
      ...fakeEvent,
      httpMethod: 'OPTIONS',
      body: null,
    };
    const result = await handler(event);
    expect(result.statusCode).toBe(200);
    expect(result.headers!['Access-Control-Allow-Origin']).toBe('*');
    expect(result.headers!['Access-Control-Allow-Headers']).toBe('*');
  })

  it.each`
    httpMethod ${'GET'} ${'PUT'} ${'DELETE'} ${'HEAD'} ${'PATCH'} ${'CONNECT'} ${'TRACE'}
  `('gives error for GET requests', async () => {
    const event: APIGatewayProxyEvent = {
      ...fakeEvent,
      httpMethod: 'GET',
    };
    const result = await handler(event);
    expect(result.statusCode).toBe(405);
  })

  it('gives error for PUT requests', async () => {
    const event: APIGatewayProxyEvent = {
      ...fakeEvent,
      httpMethod: 'PUT',
    };
    const result = await handler(event);
    expect(result.statusCode).toBe(405);
    expect(result.headers && result.headers['Access-Control-Allow-Origin']).toBe('*');
  })
})

describe('POST responses', () => {
  it('gives error & message when no body received', async () => {
    const event = { ...fakeEvent };
    delete event.body;
    const result = await handler(event);
    expect(result.statusCode).toBe(400);
    const resultBody = JSON.parse(result.body);
    expect(resultBody.error).toBe(true);
    expect(resultBody.message).toBe('No event body received');
  })

  it('gives error & message if body is too long', async () => {
    const event = {
      ...fakeEvent,
      body: 'I\'m glad you are here with me. Here at the end of all things, Sam.'.repeat(200),
    };
    expect(event.body.length).toBeGreaterThan(MAX_BODY_LENGTH);

    const result = await handler(event);
    expect(result.statusCode).toBe(400);
    const resultBody = JSON.parse(result.body);
    expect(resultBody.error).toBe(true);
    expect(resultBody.message).toBe(
      `Event body too long. (${event.body.length} > ${MAX_BODY_LENGTH})`
    );
  })

  it('gives error if parseBody returns null', async () => {
    mock_parseWriter.mockImplementationOnce(() => null);
    const event = { ...fakeEvent, body: '"' };
    const result = await handler(event);
    expect(result.statusCode).toBe(400);
    const resultBody = JSON.parse(result.body);
    expect(resultBody.error).toBe(true);
    expect(resultBody.message).toBe('Invalid body data received');
  })

  it('sends mail successfully', async () => {
    mock_sendMail.mockImplementationOnce(async () => ({ id:'', message: '' }));
    const body: RequestBody = {
      name: 'Mithrandir',
      email: 'gandalf.the.grey@middle.earth',
      message: 'Saruman, your staff is broken!',
    }
    const event = { ...fakeEvent, body: JSON.stringify(body) };
    const result = await handler(event);
    expect(result.statusCode).toBe(200);
    const resultBody = JSON.parse(result.body);
    expect(resultBody.error).toBe(false);
    expect(resultBody.message).toBe('Thanks, your message has been received.');
  })
})
