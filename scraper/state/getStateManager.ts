import AWS from 'aws-sdk';
import StateManager from './StateManager';

const testArgs = process.env.NODE_ENV === 'test' ? {
  endpoint: 'http://localhost:8000',
} : undefined;

const client = new AWS.DynamoDB.DocumentClient({
  region: 'ap-southeast-2',
  ...testArgs,
});

const getStateManager = () => {
  return new StateManager(client);
}

export default getStateManager;
