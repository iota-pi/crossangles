import { APIGatewayProxyResult } from "aws-lambda";

interface ResponseHeaders {
  [header: string]: boolean | number | string
}

const defaultHeaders: ResponseHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export const getResponse = ({
  statusCode = 200,
  message,
  headers,
}: {
  statusCode?: number,
  message?: string,
  headers?: ResponseHeaders,
}): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    body: JSON.stringify({
      error: statusCode >= 400,
      message,
    }),
  }
}
