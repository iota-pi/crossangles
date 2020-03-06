import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';

export interface ResponseOptions {
  statusCode?: number,
  message?: string,
  headers?: ResponseHeaders,
}

export interface ResponseHeaders {
  [header: string]: boolean | number | string
}

export class LambdaResponder {
  private origin: string;
  private originIsAllowed: boolean;
  shouldLog = process.env.NODE_ENV !== 'test';

  constructor (event: APIGatewayProxyEvent) {
    this.origin = event.headers.origin;
    this.originIsAllowed = this.checkOrigin(this.origin);
  }

  getResponse = (options?: ResponseOptions): APIGatewayProxyResult => {
    const { statusCode = 200, message, headers } = options || {};
    const result: APIGatewayProxyResult = {
      statusCode,
      headers: {
        ...this.baseHeaders,
        ...headers,
      },
      body: JSON.stringify({
        error: statusCode >= 400,
        message,
      }),
    };

    if (this.shouldLog) console.log(result);
    return result;
  }

  private get baseHeaders () {
    const headers: ResponseHeaders = {
      'Content-Type': 'application/json',
    };
    if (this.originIsAllowed) {
      headers['Access-Control-Allow-Origin'] = this.origin;
    }
    return headers;
  }

  private checkOrigin = (origin: string): boolean => {
    const allowedOrigins = [
      /^https:\/\/([a-z0-9]+\.)?crossangles\.(app|com)$/,
      /^https:\/\/([a-f0-9]{24}--)?crossangles2.netlify.com$/,
    ];
    const result = allowedOrigins.some(re => re.test(origin));
    if (!result && this.shouldLog) {
      console.log(`Blocking origin: ${origin}`);
    }
    return result;
  }
}
