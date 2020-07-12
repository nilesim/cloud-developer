import 'source-map-support/register'
import * as middy from "middy";
import { cors } from "middy/middlewares";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { createLogger } from '../../utils/logger';
import { updateTodo, getTodo } from '../../businessLogic/todos';

const logger = createLogger('Update todo');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => { 
   
  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
    try { 
      const todoId = event.pathParameters.todoId;

      const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);
      
      const todoItem = await getTodo(todoId, event);
  
      if (!todoItem) {
        const message = "Todo not exists";
        logger.warning("updateTodo", message);
        return {
          statusCode: 404,
          body: JSON.stringify({
            error: message
          })
        };
      }
  
      await updateTodo(todoId, updatedTodo, event);
  
      return {
        statusCode: 200,
        body: ""
      };

    } catch (error) {
      logger.error("updateTodo", error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error
        })
      };
    }
  });
  
  handler.use(
    cors({
      origin: "*",
      credentials: true
    })
  );