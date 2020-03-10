import AWS from 'aws-sdk';

export class StateManager {
  private readonly tableName = 'ScraperData';

  constructor (
    private readonly client: AWS.DynamoDB.DocumentClient,
  ) {}

  async init (ddb: AWS.DynamoDB) {
    try {
      await ddb.createTable({
        TableName: this.tableName,
        KeySchema: [
          {
            AttributeName: 'campus',
            KeyType: 'HASH',
          },
          {
            AttributeName: 'key',
            KeyType: 'RANGE',
          },
        ],
        AttributeDefinitions: [
          {
            AttributeName: 'campus',
            AttributeType: 'S',
          },
          {
            AttributeName: 'key',
            AttributeType: 'S',
          },
        ],
        BillingMode: 'PAY_PER_REQUEST',
      }).promise();
    } catch (err) {
      if (err.code !== 'ResourceInUseException') {
        throw err;
      }
    }
  }

  async drop (ddb: AWS.DynamoDB) {
    try {
      await ddb.deleteTable({
        TableName: this.tableName,
      }).promise();
    } catch (err) {
      if (err.code !== 'ResourceNotFoundException') {
        throw err;
      }
    }
  }

  async get (campus: string, key: string) {
    try {
      const response = await this.client.get({
        TableName: this.tableName,
        Key: { campus, key },
      }).promise();
      const result = response.Item.value;
      return result;
    } catch (err) {
      return undefined;
    }
  }

  async set (campus: string, key: string, value: any) {
    await this.client.put({
      TableName: this.tableName,
      Item: {
        campus,
        key,
        value,
      },
    }).promise();
  }

  async delete (campus: string, key: string) {
    await this.client.delete({
      TableName: this.tableName,
      Key: {
        campus,
        key,
      },
    }).promise();
  }
}

export default StateManager;
