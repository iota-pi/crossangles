import AWS from 'aws-sdk';

export class StateManager {
  private readonly tableName = process.env.STATE_TABLE || '';

  constructor (
    private readonly client: AWS.DynamoDB.DocumentClient,
  ) {}

  async get (campus: string, key: string) {
    try {
      const response = await this.client.get({
        TableName: this.tableName,
        Key: { campus, key },
      }).promise();
      const result = response.Item?.value;
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
