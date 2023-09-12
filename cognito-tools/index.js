// Serverless Lib ver: 0.1.2
import AWS from 'aws-sdk'

//  -----    Commit in AWS Serverless
const credentials = new AWS.SharedIniFileCredentials({profile: 'ocuba-account'})
AWS.config.credentials = credentials
AWS.config.update({region: 'sa-east-1'})

//  -----    Clients

const cognitoClient = new AWS.CognitoIdentityServiceProvider({apiVersion: '2016-04-18'});

export const checkIfUserExist = async (params) => {
  const { username, poolId } = params;
  let userExist = true;

  try {
    const paramsCognitoCheckUser = {
      UserPoolId: poolId,
      Username: username,
    }

    let userData = await cognitoClient.adminGetUser(paramsCognitoCheckUser).promise();
    console.log(userData)
    userExist = userData.Username ? true : false;

  } catch(error) {

    if (error.message === 'User does not exist.') {
      userExist = false
    } else {
      console.log(error);
      throw new Error(error.message)
    }
  }

  return userExist;
}



export const getRoleUser = async (accesToken) => {
    
    return new Promise((resolve, reject) => {
        cognitoClient.getUser({ AccessToken: accesToken }).promise()
        .then((userInfo) => {
            resolve(userInfo.UserAttributes.find((item) => item.Name === 'custom:role').Value)
        })
        .catch((error) => reject(error))
    })
    
}


export const getEmailUser = async (params) => {
    const { username, poolId } = params;

    // return new Promise((resolve, reject) => {
        const result = await cognitoClient.adminGetUser({
            Username: username,
            UserPoolId: poolId
        }).promise()
        // .then((userInfo) => {
        //     resolve(userInfo.UserAttributes.find((item) => item.Name === 'email').Value)
        // })
        // .catch((error) => reject(error))
        return result.UserAttributes.find((item) => item.Name === 'email').Value
    // })
    
}

export const getUsername = async (params) => {
    const { email, poolId } = params;

    // return new Promise((resolve, reject) => {
        const result = await cognitoClient.adminGetUser({
            Username: email,
            UserPoolId: poolId
        }).promise()
        // .then((userInfo) => {
        //     resolve(userInfo.UserAttributes.find((item) => item.Name === 'email').Value)
        // })
        // .catch((error) => reject(error))
        return result.Username
    // })
}

export const listCognitoUsers = async (params) => {
    const { poolId } = params;

    const cognitoParams = {
      UserPoolId: poolId,
      // Filter: 'STRING_VALUE',
      // Limit: 'NUMBER_VALUE',
      // PaginationToken: 'STRING_VALUE'
    };

    return new Promise((resolve, reject) => {
        cognitoClient.listUsers(cognitoParams, function(err, data) {
            if (err) reject(err)
            else {
                const result = data.Users.map((user) => {
                    return {
                        username: user.Username,
                        created_at: new Date(user.UserCreateDate).getTime(),
                        status: user.UserStatus,
                        enabled: user.Enabled,
                        ...Object.fromEntries(user.Attributes.map((attr) => {
                            return [attr.Name, attr.Value]
                        })) 
                    }
                })

                resolve({
                  items: result,
                  count: result.length,
                  totalResults: result.length,
                  offset: undefined,
                })
            }
        });
    })
}