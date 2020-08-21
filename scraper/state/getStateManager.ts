import AWS from 'aws-sdk';
import StateManager from './StateManager';

const dynamoParams: AWS.DynamoDB.ClientConfiguration = {
  region: 'ap-southeast-2',
};

const client = new AWS.DynamoDB.DocumentClient(dynamoParams);

const getStateManager = () => new StateManager(client);

export default getStateManager;
