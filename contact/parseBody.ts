import { APIGatewayEvent } from "aws-lambda";

export interface RequestBody {
  email: string,
  message: string,
  name: string,
}

export const parseBody = (event: APIGatewayEvent): RequestBody | null => {
  if (!event.body) {
    return null;
  }

  let body: Partial<RequestBody>;
  try {
    body = JSON.parse(event.body);
  } catch (error) {
    return null;
  }

  if (body.email && body.message && body.name) {
    return body as RequestBody;
  } else {
    return null;
  }
}
