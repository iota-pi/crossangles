import { APIGatewayProxyResult, APIGatewayProxyEvent, ScheduledEvent } from 'aws-lambda';
import { LambdaResponder } from '../lambda-shared/LambdaResponder';
import { standardiseHeaders } from '../lambda-shared/util';
import { screenshot } from './screenshot';
import { saveForDebug } from './dumpDebugData';

export function handler (_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult>;
export function handler (_event: ScheduledEvent): Promise<void>;
export async function handler (
  _event: APIGatewayProxyEvent | ScheduledEvent,
): Promise<APIGatewayProxyResult | void> {
  if ((_event as ScheduledEvent).source === 'aws.events') {
    // CloudWatch Event
    console.log('lambda warmed');
    return;
  }

  const event = _event as APIGatewayProxyEvent;

  standardiseHeaders(event);
  const responder = new LambdaResponder(event);
  const method = event.httpMethod.toUpperCase();

  switch (method) {
    case 'OPTIONS':
      return responder.getResponse();
    case 'POST':
      return handlePost(event, responder);
  }

  return responder.getResponse({
    statusCode: 405,
    message: `Got unexpected HTTP method "${event.httpMethod}"`,
  });
}

export const buildQueryString = (data: object) => {
  const pairs = Object.entries(data).map(x => {
    const key = x[0];
    const value = encodeURIComponent(JSON.stringify(x[1]));
    return `${key}=${value}`;
  });
  return ((pairs.length > 0) ? '?' : '') + pairs.join('&');
}

const handlePost = async (event: APIGatewayProxyEvent, responder: LambdaResponder) => {
  if (!event.body) {
    return responder.getResponse({
      statusCode: 400,
      message: 'No event body received',
    });
  }

  try {
    const data = JSON.parse(event.body);
    const { width, height } = data.viewport;
    const viewport = { width, height };
    delete data.viewport;
    console.log(`Using viewport: ${viewport}`);

    const baseURI = event.headers.origin + '/timetable/index.html';
    const queryString = buildQueryString(data);
    const uri = baseURI + queryString;
    console.log(`Timetable URI is: ${uri}`);

    const debugPromise = saveForDebug(data);
    const imagePromise = screenshot(uri, viewport);

    try {
      await debugPromise;
      console.log('debug data saved');
    } catch (error) {
      console.error('failed to save debug info', error);
    }

    const image = await imagePromise;
    console.log('Finished saving as image');
    return responder.getResponse({
      data: image,
    });
  } catch (e) {
    console.error('caught unexpected error', e);
    return responder.getResponse({
      statusCode: 500,
      message: 'An error occurred while attempting to save your timetable as an image',
    });
  }
}
