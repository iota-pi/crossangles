import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import StateManager from './StateManager';

const dynamoParams: DynamoDBClientConfig = {
  region: 'ap-southeast-2',
};

const baseClient = new DynamoDBClient(dynamoParams);
const client = DynamoDBDocumentClient.from(baseClient);

const getStateManager = () => new StateManager(client);

export default getStateManager;
