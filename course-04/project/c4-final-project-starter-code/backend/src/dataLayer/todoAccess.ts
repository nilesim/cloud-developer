import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoUpdate } from '../models/TodoUpdate';
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";
import { createLogger } from "../utils/logger";
import { TodoItem } from '../models/TodoItem'

const logger = createLogger('todoAccess');
const XAWS = AWSXRay.captureAWS(AWS)



export class TodoAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todoTable = process.env.TODO_TABLE,
        private readonly todoTableIndex = process.env.TODO_USER_ID_INDEX) {
    }

    async getTodos(userId: string): Promise<TodoItem[]> {
        logger.info('Getting all todo list')

        const result = await this.docClient.query({
            TableName: this.todoTable,
            IndexName: this.todoTableIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        const items = result.Items
        return items as TodoItem[]
    }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        await this.docClient.put({
            TableName: this.todoTable,
            Item: todo
        }).promise()
        logger.info("Creating new todo", todo);
        return todo
    }

    async getTodo(todoId: string, userId: string): Promise<TodoItem> {
        const todos = await this.docClient.query({
            TableName: this.todoTable,
            IndexName: this.todoTableIndex,
            KeyConditionExpression: 'todoId = :todoId and userId = :userId',
            ExpressionAttributeValues: {
                ':todoId': todoId,
                ':userId': userId
            }
        }).promise()
        if (todos.Count == 0) {
            logger.error(`Error deleting non existing todo with id ${todoId}`)
            return undefined
        }
        return todos.Items[0] as TodoItem
    }

    async updateTodo(todoId: string, userId: string, updateTodoRequest: UpdateTodoRequest): Promise<TodoUpdate> {
        logger.info(`Updating todo by id: ${todoId}`);
        const updatedTodo = await this.docClient.update({
            TableName: this.todoTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
            UpdateExpression: 'set #namefield = :namefield, #dueDate = :dueDate, #done = :done',
            ExpressionAttributeNames: {
                "#namefield": "name",
                "#dueDate": "dueDate",
                "#done": "done"
            },
            ExpressionAttributeValues: {
                ":namefield": updateTodoRequest.name,
                ":dueDate": updateTodoRequest.dueDate,
                ":done": updateTodoRequest.done
            },
            ReturnValues: "UPDATED_NEW"
        }).promise()
        return updatedTodo.Attributes as TodoUpdate
    }

    async deleteTodo(todoId: string, userId: string): Promise<void> {
        logger.info(`Deleting todo by id : ${todoId}`);
        const param = {
            TableName: this.todoTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            }
        }
        await this.docClient.delete(param).promise()
    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        logger.info('Creating a local DynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }
    return new XAWS.DynamoDB.DocumentClient()
}
