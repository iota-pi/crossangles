import { APIGatewayProxyEvent } from 'aws-lambda'

export function standardiseHeaders(event: APIGatewayProxyEvent) {
  if (!event.headers) return
  const headers: typeof event.headers = {}
  for (const key in event.headers) {
    headers[key.toLowerCase()] = event.headers[key]
  }
  event.headers = headers
}
