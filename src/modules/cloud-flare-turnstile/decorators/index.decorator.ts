import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { StatusResponse } from 'src/common/StatusResponse';
import {
  TokenCloudflareIsRequireError,
  TokenCloudflareNotValidError,
} from '../dto/error-response.dto';

export function CloudFlareTurnStileCapChaApiDocs() {
  return applyDecorators(
    ApiExtraModels(TokenCloudflareIsRequireError, TokenCloudflareNotValidError), // Khai báo models trước
    ApiResponse({
      status: 400,
      description:
        'Bad Request. Token Cloud Flare TurnStile is required and Token Cloud Flare TurnStile is invalid or expired',
      content: {
        'application/json': {
          schema: {
            type: 'object',
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
          examples: {
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
  );
}
