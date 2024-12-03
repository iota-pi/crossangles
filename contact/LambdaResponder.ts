import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';
import { Logger } from 'winston';

export interface ResponseOptions {
  statusCode?: number,
  message?: string,
  headers?: ResponseHeaders,
  data?: string,
}

export interface ResponseHeaders {
  [header: string]: boolean | number | string,
}

export class LambdaResponder {
  private origin: string;
  private originIsAllowed: boolean;
  logger?: Logger;

  constructor (event: APIGatewayProxyEvent, logger?: Logger) {
    this.origin = event.headers.origin || '';
    this.originIsAllowed = this.checkOrigin(this.origin);
    this.logger = logger;
  }

  getResponse = (options?: ResponseOptions): APIGatewayProxyResult => {
    const { statusCode = 200, message, headers, data } = options || {};
    const body = JSON.stringify({
      error: statusCode >= 400,
      message,
      data,
    });

    const result: APIGatewayProxyResult = {
      statusCode,
      headers: {
        ...this.baseHeaders,
        ...headers,
      },
      body,
    };

    this.logger?.info(result);
    return result;
  }

  private get baseHeaders () {
    const headers: ResponseHeaders = {
      'Content-Type': 'application/json',
    };
    if (this.originIsAllowed) {
      headers['Access-Control-Allow-Origin'] = this.origin;
      headers['Access-Control-Allow-Headers'] = '*';
      headers['Access-Control-Allow-Methods'] = '*';
    }
    return headers;
  }

  private checkOrigin = (origin: string): boolean => {
    const allowedOrigins = [
      /^https:\/\/([^.]+\.)*crossangles\.app$/,
    ];
    const result = allowedOrigins.some(re => re.test(origin));
    if (!result) {
      this.logger?.info(`Blocking origin: ${origin}`);
    }
    return result;
  }
}
