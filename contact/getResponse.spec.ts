import { getResponse } from './getResponse';

describe('getResponse', () => {
  it('gives expected default value', () => {
    expect(getResponse({})).toEqual({
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: false }),
    });
  })

  it('returns messages', () => {
    const message = 'What news from the north, Riders of Rohan?';
    expect(getResponse({ message })).toEqual({
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: false, message }),
    });
  })

  it('adds and/or overwrites headers', () => {
    const headers = {
      'Access-Control-Allow-Origin': 'crossangles.app',
      'X-Custom-Header': 'abcdefg',
    };
    expect(getResponse({ headers })).toEqual({
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ error: false }),
    });
  })

  it.each`
    statusCode ${400} ${403} ${405} ${500} ${599}
  `('gives error based on status code', ({ statusCode }) => {
    expect(getResponse({ statusCode })).toEqual({
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: true }),
    });
  })
})
