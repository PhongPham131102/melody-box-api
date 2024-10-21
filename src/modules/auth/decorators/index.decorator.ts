import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  getSchemaPath,
} from '@nestjs/swagger';
import { StatusResponse } from 'src/common/StatusResponse';
import {
  TokenCloudflareIsRequireError,
  TokenCloudflareNotValidError,
} from 'src/modules/cloud-flare-turnstile/dto/error-response.dto';
import { CreateUserDto } from 'src/modules/user/dto/create-user.dto';
import { LoginUserDto } from 'src/modules/user/dto/login-user.dto';

export function SignUpDocsAPI() {
  return applyDecorators(
    ApiOperation({
      summary: 'User registration',
      operationId: 'registerUser',
      description:
        'This endpoint allows a new user to register by providing a username, password, name, email, and role ID. Upon successful registration, the user data is returned.',
    }),
    ApiResponse({
      status: 201,

      description: 'User successfully registered.',
      schema: {
        example: {
          status: 'SUCCESS',
          message: 'Create An User Success',
          data: {
            username: 'your-user-name',
            name: 'Nguyen Van A',
            role: '507f1f77bcf86cd799439011',
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description:
        'Return response for various cases of input validation errors.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            discriminator: {
              propertyName: 'errorType',
              mapping: {
                EmailExists: '#/components/schemas/EmailExistsError',
                InvalidEmail: '#/components/schemas/InvalidEmailError',
                UsernameExists: '#/components/schemas/UsernameExistsError',
                RoleNotExists: '#/components/schemas/InvalidRoleError',
              },
            },
            oneOf: [
              { $ref: '#/components/schemas/EmailExistsError' },
              { $ref: '#/components/schemas/InvalidEmailError' },
              { $ref: '#/components/schemas/UsernameExistsError' },
              { $ref: '#/components/schemas/InvalidRoleError' },
            ],
          },
          examples: {
            EmailExists: {
              summary: 'Email already exists error',
              value: {
                status: 4,
                message: 'Email Already Exists',
                column: 'email',
              },
            },
            UsernameExists: {
              summary: 'Username already exists error',
              value: {
                status: 5,
                message: 'Username Already Exists',
                column: 'username',
              },
            },
            InvalidEmail: {
              summary: 'Invalid email format error',
              value: {
                error: 'Bad Request',
                message: ['email must be an email'],
                statusCode: 400,
              },
            },
            RoleNotExists: {
              summary: 'Role is not exists',
              value: {
                error: 'Bad Request',
                message: ['Role Is Not Valid Value'],
                statusCode: 400,
              },
            },
          },
        },
      },
    }),
    ApiBody({ type: CreateUserDto }),
  );
}
export function SignInDocsAPI() {
  return applyDecorators(
    ApiOperation({
      summary: 'User login',
      operationId: 'loginUser',
      description:
        'This endpoint allows an existing user to log in by providing a valid username and password. Upon successful login, an access token is returned for authorization purposes.',
    }),
    ApiResponse({
      status: 200,
      description: 'User successfully logged in.',
      schema: {
        example: {
          accessToken: 'jwt_token_here',
          userId: '507f1f77bcf86cd799439011',
          status: 'SUCCESS',
          message: 'Login Success',
          role: 'admin',
          permission: ['READ', 'WRITE'],
          userData: {
            username: 'your-user-name',
            name: 'Nguyen Van A',
          },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized. Incorrect username or password.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'INVALID_CREDENTIALS' },
              message: {
                type: 'string',
                example: 'Invalid username or password',
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Multiple possible errors for status 400',
      content: {
        'application/json': {
          schema: {
            oneOf: [
              // Thêm cả hai trường hợp từ CloudFlare và SignIn vào đây
              {
                type: 'object',
                properties: {
                  status: { type: 'number', example: 9 },
                  message: {
                    type: 'string',
                    example: 'User Name Or Password Is Not Correct',
                  },
                },
              },
              {
                discriminator: {
                  propertyName: 'errorType',
                  mapping: {
                    TokenCloudflareIsRequire: getSchemaPath(
                      TokenCloudflareIsRequireError,
                    ),
                    TokenCloudflareNotValid: getSchemaPath(
                      TokenCloudflareNotValidError,
                    ),
                  },
                },
                oneOf: [
                  { $ref: getSchemaPath(TokenCloudflareIsRequireError) },
                  { $ref: getSchemaPath(TokenCloudflareNotValidError) },
                ],
              },
            ],
          },
          examples: {
            InvalidCredentials: {
              summary: 'User Name Or Password Is Not Correct',
              value: {
                status: 9,
                message: 'User Name Or Password Is Not Correct',
              },
            },
            TokenCloudflareIsRequire: {
              summary: 'Token Cloud Flare TurnStile is required.',
              value: {
                status: StatusResponse.TOKEN_CLOUDFLARE_IS_REQUIRE,
                message:
                  'Token Cloud Flare TurnStile Is Required Please Check Payload',
                statusCode: 400,
              },
            },
            TokenCloudflareNotValid: {
              summary: 'Token Cloud Flare TurnStile is invalid or expired.',
              value: {
                status: StatusResponse.TOKEN_CLOUDFLARE_NOT_VALID,
                message:
                  'Token Cloud Flare TurnStile May Be Expire Or Not Valid Please Reload Page and Try Again!',
                statusCode: 400,
              },
            },
          },
        },
      },
    }),
    ApiBody({ type: LoginUserDto }),
  );
}
export function RefreshTokenDocsAPI() {
  return applyDecorators(
    ApiOperation({
      summary: 'Refresh access token',
      operationId: 'refreshToken',
      description:
        'Generates a new access token using the provided refresh token.',
    }),
    ApiResponse({
      status: 200,
      description: 'New access token generated.',
      schema: {
        example: {
          accessToken: 'new_jwt_token_here',
          status: 'SUCCESS',
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid refresh token.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              statusCode: { type: 'integer', example: 400 },
              message: { type: 'string', example: 'Invalid refresh token' },
              error: { type: 'string', example: 'Bad Request' },
            },
          },
        },
      },
    }),
    ApiOperation({
      summary: 'Refresh access token',
      operationId: 'refreshToken',
      description:
        'Generates a new access token and updates the refresh token using the provided refresh token. This endpoint checks the validity of the provided refresh token and re-issues tokens accordingly.',
    }),
    ApiResponse({
      status: 200,
      description: 'New access token generated successfully.',
      schema: {
        example: {
          accessToken: 'new_jwt_token_here',
          status: 'SUCCESS',
        },
      },
    }),
    ApiResponse({
      status: 400,
      description:
        'Bad Request. The provided refresh token is missing or invalid.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              statusCode: { type: 'integer', example: 400 },
              message: { type: 'string', example: 'Invalid refresh token' },
              error: { type: 'string', example: 'Bad Request' },
            },
          },
          examples: {
            MissingToken: {
              summary: 'No refresh token provided',
              value: {
                statusCode: 400,
                message: 'Could not find refresh token',
                error: 'Bad Request',
              },
            },
            InvalidToken: {
              summary: 'Provided refresh token is invalid',
              value: {
                statusCode: 400,
                message: 'Invalid refresh token',
                error: 'Bad Request',
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized. The provided refresh token has expired.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              statusCode: { type: 'integer', example: 401 },
              message: { type: 'string', example: 'EXPIRED_REFRESH_TOKEN' },
              error: { type: 'string', example: 'Unauthorized' },
            },
          },
        },
      },
    }),
  );
}
export function LogOutDocsAPI() {
  return applyDecorators(
    ApiOperation({
      summary: 'User logout',
      operationId: 'logoutUser',
      description:
        'Logs out the authenticated user by clearing their refresh token cookie.',
    }),
    ApiResponse({
      status: 204,
      description: 'User successfully logged out. No content returned.',
    }),
  );
}
