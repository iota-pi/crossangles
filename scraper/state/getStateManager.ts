import AWS from 'aws-sdk';
import StateManager from './StateManager';

const testArgs = process.env.NODE_ENV === 'test' ? {
  endpoint: 'http://localhost:8000',
} : undefined;

const dynamoParams = {
  region: 'ap-southeast-2',
  ...testArgs,
}

const ddb = new AWS.DynamoDB(dynamoParams);
const client = new AWS.DynamoDB.DocumentClient(dynamoParams);

export const getStateManager = async () => {
  const state = new StateManager(client);
  await state.init(ddb);
  return state;
}

export const cleanStateManager = async () => {
  const state = new StateManager(client);
  await state.drop(ddb);
}

export default getStateManager;
