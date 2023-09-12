// Serverless Lib ver: 0.1.2
import AWS from 'aws-sdk'

const dynamoClient = new AWS.DynamoDB.DocumentClient()
const cognitoClient = new AWS.CognitoIdentityServiceProvider({apiVersion: '2016-04-18'})


//  -----    Save session
export const saveSession = async (data) => {
  const { AccessToken, RefreshToken, TokensExpiresIn, table, hash, hashKey } = data;
  
  const [,accessPayload] = AccessToken.split('.');

  const accessPayloadBuff = Buffer.from(accessPayload.replace(/\./g, ''), 'base64');
  const accessPayloadText = accessPayloadBuff.toString('ascii');

  const payloadTokenData = JSON.parse(accessPayloadText);

  const params = {
    TableName : table,
    Item: {
      jti: payloadTokenData.origin_jti,
      accessToken: AccessToken,
      refreshToken: RefreshToken,
      expiresIn: TokensExpiresIn,
      [hashKey]: hash
    }
  }

  await dynamoClient.put(params).promise();
}


//  -----    Check Session
export const checkSession = async (event, params) => {
  const { table, hashKey, cognitoClientID } = params;

  if (!event.requestContext.authorizer) 
  throw new Error('Authorizer is not present in API event')

  const { username, origin_jti: jti } = event.requestContext.authorizer

  const dynamoParams = {
    TableName : table,
    Key: {
      [hashKey]: username,
      'jti': jti
    }
  }

  const tokensResult = await dynamoClient.get(dynamoParams).promise();

  if (!tokensResult.Item) {
    throw new Error('Session is expired');
  }

  const refreshToken = tokensResult.Item.refreshToken;

  const  refreshParams = {
    AuthFlow: 'REFRESH_TOKEN',
    ClientId: cognitoClientID,
    AuthParameters: {
      'REFRESH_TOKEN': refreshToken,
    }
  }

  let newsTokens;
  try {

    newsTokens = await cognitoClient.initiateAuth(refreshParams).promise();

  } catch(error) {

    if (error.message && error.message === 'Refresh Token has been revoked') {
      throw new Error('Session is expired')
    } else {
      throw new Error(error)
    }

  }

  const { AuthenticationResult } = newsTokens
  const [,accessPayload] = AuthenticationResult.AccessToken.split('.')

  let accessPayloadBuff = Buffer.from(accessPayload.replace(/\./g, ''), 'base64')
  let accessPayloadText = accessPayloadBuff.toString('ascii')

  const payloadTokenData = JSON.parse(accessPayloadText)

  const paramsSession = {
    TableName : table,
    Item: {
      jti: payloadTokenData.origin_jti,
      accessToken: AuthenticationResult.AccessToken,
      refreshToken,
      expiresIn: AuthenticationResult.TokensExpiresIn,
      [hashKey]: username,
    }
  }

  await dynamoClient.put(paramsSession).promise()

  return { ...AuthenticationResult }
}