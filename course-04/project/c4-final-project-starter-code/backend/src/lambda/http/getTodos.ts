import 'source-map-support/register'
import * as middy from "middy";
import { cors } from "middy/middlewares";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger';
import { getTodos } from '../../businessLogic/todos';

const logger = createLogger('List todos');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Listing todo items ',event)
  try {
    const todos = await getTodos(event);
    logger.info('Todo items: ', todos)
    return {
      statusCode: 200,
      body: JSON.stringify({
        items: todos
      })
    };
  } catch (error) {
    if(error.statusCode == 403) {
      console.error('The item does not has image yet.')
    }
  }
});

handler.use(
  cors({
    origin: "*"
  })
)