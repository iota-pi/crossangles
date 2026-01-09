import { APIGatewayProxyEvent } from 'aws-lambda'
import { standardiseHeaders } from './util'
import { fakeEvent } from './test/util'

it.each`
  key
  ${'origin'}
  ${'Origin'}
  ${'ORIGIN'}
`('handles origin case "$origin"', ({ key }) => {
  const origin = 'https://crossangles.app'
  const event: APIGatewayProxyEvent = { ...fakeEvent, headers: { [key]: origin } }
  standardiseHeaders(event)
  expect(event.headers.origin).toBe(origin)
})
