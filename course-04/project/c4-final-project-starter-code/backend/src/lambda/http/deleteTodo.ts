import 'source-map-support/register'
import * as middy from "middy";
import { cors } from "middy/middlewares";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger';
import { deleteTodo, getTodo , deleteS3Item } from '../../businessLogic/todos';

const logger = createLogger('deleteTodo');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  
  logger.info('Deleting todo item ',todoId) 

  const todoItem = await getTodo(todoId, event)

  if (!todoItem) {
    const message = "Todo does not exist";
    logger.warning("deleteTodo", message);
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: message
      })
    };
  }
  
  await deleteTodo(todoId, event);

  await deleteS3Item(todoId);
  
  return {
    statusCode: 204,
    body: JSON.stringify({
      result: "successfully deleted"
    })
  };

});

handler.use(
  cors({
    origin: "*",
    credentials: true
  })
)