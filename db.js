import { DynamoDBClient } from "@aws-sdk/client-dynamodb"; 
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"; 
import "dotenv/config"; 

const client = new DynamoDBClient({ region: process.env.AWS_REGION }); 

export const docClient = DynamoDBDocumentClient.from(client);
