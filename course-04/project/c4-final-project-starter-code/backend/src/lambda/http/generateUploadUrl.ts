import 'source-map-support/register'
import * as middy from "middy";
import { cors } from "middy/middlewares";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger';
import * as AWSXRay from 'aws-xray-sdk'
import * as AWS  from 'aws-sdk'

const logger = createLogger ('Generate Upload URLs')

const XAWS = AWSXRay.captureAWS(AWS)

const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION, 10)


const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  logger.info("Creating upload url for todo id : ", todoId)

  try {
    const url = getUploadUrl(todoId) 
    logger.info("Upload url : ", url)
    return {
      statusCode: 201,
      body: JSON.stringify({ uploadUrl : url })
    }

  } catch (error) { 
    logger.error("Eror in generating upload url:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error
      })
    };
  }
})

function getUploadUrl(todoId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  })
}

handler.use(
  cors({
    origin: "*",
    credentials: true
  })
)