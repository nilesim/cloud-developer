import * as uuid from "uuid";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import { TodoItem } from "../models/TodoItem";
import { TodoUpdate } from "../models/TodoUpdate";
import { TodoAccess } from "../dataLayer/todoAccess";
import { APIGatewayProxyEvent } from "aws-lambda";
import { getUserId } from "../auth/utils";
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";
import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

const bucketName = process.env.IMAGES_S3_BUCKET

const todoAccess = new TodoAccess();

const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})


export const getTodos = async (event: APIGatewayProxyEvent): Promise<TodoItem[]> => {
    const userId = getUserId(event);
    return await todoAccess.getTodos(userId);
};

export const getTodo = async (todoId: string, event: APIGatewayProxyEvent): Promise<TodoItem> => {
    const userId = getUserId(event);
    return await todoAccess.getTodo(todoId, userId);
};

export const createTodo = async (createTodoRequest: CreateTodoRequest, event: APIGatewayProxyEvent): Promise<TodoItem> => {
    const todoId = uuid.v4();
    const userId = getUserId(event);
    return await todoAccess.createTodo({
        createdAt: new Date().toISOString(),
        done: false,
        dueDate: createTodoRequest.dueDate,
        name: createTodoRequest.name,
        todoId,
        userId,
        attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`
    });
};


export const updateTodo = async (todoId: string, request: UpdateTodoRequest, event: APIGatewayProxyEvent): Promise<TodoUpdate> => {
    const userId = getUserId(event);
    return await todoAccess.updateTodo(todoId, userId, request);
};

export const deleteTodo = async (todoId: string, event: APIGatewayProxyEvent): Promise<void> => {
    const userId = getUserId(event);
    return await todoAccess.deleteTodo(todoId, userId);
};


export const deleteS3Item = async (todoId: string): Promise<void> => {
    if (!todoId) {
        return;
    }
    await s3.deleteObject({
        Bucket: bucketName,
        Key: todoId
    }).promise();
}