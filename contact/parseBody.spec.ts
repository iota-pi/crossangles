import { parseBody as parseBody, RequestBody } from './parseBody';
import { APIGatewayEvent } from 'aws-lambda';
import { fakeEvent } from './test/util';

describe('parseBody', () => {
  it('returns correct object given suitable parameters', () => {
    const body: RequestBody = {
      name: 'Samwise Gamgee',
      email: 'samwise.gamgee@middle.earth',
      message:
        'Gandalf! I thought you were dead! But then I thought I was dead myself.\n' +
        'Is everything sad going to come untrue?',
    };
    const event: APIGatewayEvent = {
      ...fakeEvent,
      body: JSON.stringify(body),
    };
    expect(parseBody(event)).toEqual(body);
  })

  it('returns null for empty body', () => {
    const event: APIGatewayEvent = {
      ...fakeEvent,
      body: '',
    };
    expect(parseBody(event)).toBeNull();
  })

  it('returns null for invalid JSON', () => {
    const event: APIGatewayEvent = {
      ...fakeEvent,
      body: '"',
    };
    expect(parseBody(event)).toBeNull();
  })

  it('returns null for empty string', () => {
    const event: APIGatewayEvent = {
      ...fakeEvent,
      body: '""',
    };
    expect(parseBody(event)).toBeNull();
  })

  it('returns null for missing email', () => {
    const body: Omit<RequestBody, 'email'> = {
      name: 'a',
      message: 'a',
    }
    const event: APIGatewayEvent = {
      ...fakeEvent,
      body: JSON.stringify(body),
    };
    expect(parseBody(event)).toBeNull();
  })

  it('returns null for empty email', () => {
    const body: RequestBody = {
      name: 'a',
      email: '',
      message: 'a',
    }
    const event: APIGatewayEvent = {
      ...fakeEvent,
      body: JSON.stringify(body),
    };
    expect(parseBody(event)).toBeNull();
  })

  it('returns null for missing message', () => {
    const body: Omit<RequestBody, 'message'> = {
      name: 'a',
      email: 'a',
    }
    const event: APIGatewayEvent = {
      ...fakeEvent,
      body: JSON.stringify(body),
    };
    expect(parseBody(event)).toBeNull();
  })

  it('returns null for empty message', () => {
    const body: RequestBody = {
      name: 'a',
      email: 'a',
      message: '',
    }
    const event: APIGatewayEvent = {
      ...fakeEvent,
      body: JSON.stringify(body),
    };
    expect(parseBody(event)).toBeNull();
  })

  it('returns null for missing message', () => {
    const body: Omit<RequestBody, 'name'> = {
      email: 'a',
      message: 'a',
    }
    const event: APIGatewayEvent = {
      ...fakeEvent,
      body: JSON.stringify(body),
    };
    expect(parseBody(event)).toBeNull();
  })

  it('returns null for empty message', () => {
    const body: RequestBody = {
      name: '',
      email: 'a',
      message: 'a',
    }
    const event: APIGatewayEvent = {
      ...fakeEvent,
      body: JSON.stringify(body),
    };
    expect(parseBody(event)).toBeNull();
  })
})
