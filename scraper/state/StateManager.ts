import {
  GetCommand,
  DynamoDBDocumentClient,
  PutCommand,
  DeleteCommand
} from '@aws-sdk/lib-dynamodb';
import zlib from 'zlib';

class StateManager {
  private readonly tableName = process.env.STATE_TABLE || '';

  constructor(
    private readonly client: DynamoDBDocumentClient,
  ) {}

  async get(campus: string, key: string) {
    try {
      const response = await this.client.send(new GetCommand({
        TableName: this.tableName,
        Key: { campus, key },
      }));
      const result = response.Item?.value;
      return result;
    } catch (err) {
      return undefined;
    }
  }

  async set(campus: string, key: string, value: any) {
    await this.client.send(new PutCommand({
      TableName: this.tableName,
      Item: {
        campus,
        key,
        value,
      },
    }));
  }

  async getBlob(campus: string, key: string) {
    const blob = await this.get(campus, key);
    if (blob) {
      const json = zlib.brotliDecompressSync(blob).toString('utf-8');
      return JSON.parse(json) || [];
    }
    return blob;
  }

  async setBlob(campus: string, key: string, value: any) {
    const json = JSON.stringify(value);
    const compressedData = zlib.brotliCompressSync(Buffer.from(json));
    await this.set(campus, key, compressedData);
  }

  async delete(campus: string, key: string) {
    await this.client.send(new DeleteCommand({
      TableName: this.tableName,
      Key: {
        campus,
        key,
      },
    }));
  }
}

export default StateManager;
