import { LambdaResponder } from './LambdaResponder';
import { fakeEvent } from './test/util';

describe('LambdaResponder', () => {
  it.each`
    origin
    ${'https://crossangles.app'}
    ${'https://unsw.crossangles.app'}
    ${'https://next.crossangles.app'}
    ${'https://usyd.crossangles.app'}
    ${'https://uts.crossangles.app'}
    ${'https://crossangles.com'}
    ${'https://staging.crossangles.com'}
    ${'https://usyd.crossangles.com'}
    ${'https://staging.usyd.crossangles.com'}
    ${'https://abc.crossangles.com'}
  `('allows CORS from $origin', ({ origin }) => {
    const event = { ...fakeEvent, headers: { origin } };
    const r = new LambdaResponder(event);
    const result = r.getResponse({});
    expect(result.statusCode).toBe(200);
    expect(result.headers!['Access-Control-Allow-Origin']).toBe(origin);
  })

  it.each`
    origin
    ${'http://crossangles.app'}
    ${'http://crossangles.com'}
    ${'http://crossangles2.netlify.com'}
    ${'https://attack-crossangles.app'}
    ${'https://mycrossangles.app'}
    ${'https://mycrossangles.com'}
    ${'https://crossangles.net'}
    ${'https://crossangles.com.au'}
    ${'https://crossangles.app.dodgywebsite.com'}
  `('allows CORS from $origin', ({ origin }) => {
    const event = { ...fakeEvent, headers: { origin } };
    const r = new LambdaResponder(event);
    const result = r.getResponse({});
    expect(Object.keys(result.headers!)).not.toContain('Access-Control-Allow-Origin');
  })

  it('gives expected default value', () => {
    const r = new LambdaResponder(fakeEvent);
    expect(r.getResponse({})).toEqual({
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: false }),
    });
  })

  it('returns messages', () => {
    const message = 'What news from the north, Riders of Rohan?';
    const r = new LambdaResponder(fakeEvent);
    expect(r.getResponse({ message })).toEqual({
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: false, message }),
    });
  })

  it('adds and/or overwrites headers', () => {
    const headers = {
      'Access-Control-Allow-Origin': 'crossangles.app',
      'X-Custom-Header': 'abcdefg',
    };
    const r = new LambdaResponder(fakeEvent);
    expect(r.getResponse({ headers })).toEqual({
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
    const r = new LambdaResponder(fakeEvent);
    expect(r.getResponse({ statusCode })).toEqual({
      statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: true }),
    });
  })
})