import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger';
import * as middy from "middy";
import { cors } from "middy/middlewares";
import { createTodo } from '../../businessLogic/todos';

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

const logger = createLogger('createTodo');

export const handler = middy (async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)

  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  const newItem = await createTodo(newTodo, event)

  return {
    statusCode: 201,
    body: JSON.stringify({
      newItem
    })
  };
});

handler.use(
  cors({
    origin: "*",
    credentials: true
  })
)