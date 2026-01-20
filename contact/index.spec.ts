import { APIGatewayProxyEvent } from 'aws-lambda'
import { handler, MAX_BODY_LENGTH } from '.'
import { sendMail } from './sendMail'
import { RequestBody } from './parseBody'
import { fakeEvent } from './test/util'

vi.mock('./sendMail')
const mock_sendMail = vi.mocked(sendMail)


describe('HTTP methods', () => {
  it('responds to OPTIONS requests with exit code 200', async () => {
    const origin = 'https://theshire.crossangles.app'
    const event: APIGatewayProxyEvent = {
      ...fakeEvent,
      httpMethod: 'OPTIONS',
      body: null,
      headers: { origin },
    }
    const result = await handler(event)
    expect(result.statusCode).toBe(200)
    expect(result.headers!['Access-Control-Allow-Origin']).toBe(origin)
    expect(result.headers!['Access-Control-Allow-Headers']).toBe('*')
  })

  it.each`
    key
    ${'origin'}
    ${'Origin'}
    ${'ORIGIN'}
  `('handles multiple header cases "$key"', async ({ key }) => {
    const origin = 'https://crossangles.app'
    const event: APIGatewayProxyEvent = {
      ...fakeEvent,
      httpMethod: 'OPTIONS',
      body: null,
      headers: { [key]: origin },
    }
    const result = await handler(event)
    expect(result.statusCode).toBe(200)
    expect(result.headers!['Access-Control-Allow-Origin']).toBe(origin)
  })

  it.each`
    httpMethod
    ${'GET'}
    ${'PUT'}
    ${'DELETE'}
    ${'HEAD'}
    ${'PATCH'}
    ${'CONNECT'}
    ${'TRACE'}
  `('gives error for $httpMethod requests', async ({ httpMethod }) => {
    const event: APIGatewayProxyEvent = {
      ...fakeEvent,
      httpMethod,
    }
    const result = await handler(event)
    expect(result.statusCode).toBe(405)
  })
})

describe('POST method responses', () => {
  it('gives error & message when no body received', async () => {
    const event = { ...fakeEvent, body: null }
    const result = await handler(event)
    expect(result.statusCode).toBe(400)
    const resultBody = JSON.parse(result.body)
    expect(resultBody.error).toBe(true)
    expect(resultBody.message).toBe('No event body received')
  })

  it('gives error & message if body is too long', async () => {
    const body: RequestBody = {
      name: 'Frodo Baggins',
      email: 'frodo.baggins@middle.earth',
      message: 'I\'m glad you are here with me. Here at the end of all things, Sam.'.repeat(200),
    }
    const event = {
      ...fakeEvent,
      body: JSON.stringify(body),
    }
    expect(event.body.length).toBeGreaterThan(MAX_BODY_LENGTH)

    const result = await handler(event)
    expect(result.statusCode).toBe(400)
    const resultBody = JSON.parse(result.body)
    expect(resultBody.error).toBe(true)
    expect(resultBody.message).toBe(
      `Event body too long. (${event.body.length} > ${MAX_BODY_LENGTH})`,
    )
  })

  it('gives error if parseBody returns null', async () => {
    const event = { ...fakeEvent, body: 'null' }
    const result = await handler(event)
    expect(result.statusCode).toBe(400)
    const resultBody = JSON.parse(result.body)
    expect(resultBody.error).toBe(true)
    expect(resultBody.message).toBe('Invalid body data received')
  })

  it.each`
    email
    ${'gandalf.middle@earth'}
    ${'gandalf.middle@'}
    ${'@middle.earth'}
    ${'a@.com'}
  `('gives error if given an invalid email', async ({ email }) => {
    const body: RequestBody = {
      name: 'Gandalf the White',
      email,
      message: 'Many that live deserve death. Some that die deserve life.',
    }
    const event = { ...fakeEvent, body: JSON.stringify(body) }
    const result = await handler(event)
    expect(result.statusCode).toBe(400)
    const resultBody = JSON.parse(result.body)
    expect(resultBody.error).toBe(true)
    expect(resultBody.message).toContain('Invalid email address')
    expect(resultBody.message).toContain(email)
  })

  it('sends mail successfully', async () => {
    mock_sendMail.mockImplementationOnce(async () => ({ id: '', message: '', status: 200 }))
    const body: RequestBody = {
      name: 'Mithrandir',
      email: 'gandalf.the.grey@middle.earth',
      message: 'Saruman, your staff is broken!',
    }
    const event = { ...fakeEvent, body: JSON.stringify(body) }
    const result = await handler(event)
    expect(result.statusCode).toBe(200)
    const resultBody = JSON.parse(result.body)
    expect(resultBody.error).toBe(false)
    expect(resultBody.message).toBe('Thanks, your message has been received')
  })
})
