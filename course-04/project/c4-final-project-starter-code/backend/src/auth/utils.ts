import { decode } from 'jsonwebtoken'

import { JwtPayload } from './JwtPayload'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { createLogger } from '../utils/logger';

const logger = createLogger('utils');

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtPayload
  return decodedJwt.sub
}


export function getJwtToken(event: APIGatewayProxyEvent) : string {
  const authorization = event.headers.Authorization
  if (!authorization) {
    logger.error("Missing authorization header")
  }
  const split = authorization.split(' ')
  if (!split || split.length < 2) {
    logger.error("Missing authorization header")
  }
  const jwtToken = split[1]
  return jwtToken
}

export function getUserId(event: APIGatewayProxyEvent) : string {
  const jwtToken =  getJwtToken(event)
  const userId = parseUserId(jwtToken)
  return userId
}