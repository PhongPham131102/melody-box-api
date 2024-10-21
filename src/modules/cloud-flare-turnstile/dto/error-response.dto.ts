import { ApiProperty } from '@nestjs/swagger';

export class TokenCloudflareIsRequireError {
  @ApiProperty({ example: 11 })
  status: number;

  @ApiProperty({
    example: 'Token Cloud Flare TurnStile Is Required Please Check Payload',
  })
  message: string;

  @ApiProperty({ example: 400 })
  statusCode: number;
}

export class TokenCloudflareNotValidError {
  @ApiProperty({ example: 12 })
  status: number;

  @ApiProperty({
    example:
      'Token Cloud Flare TurnStile May Be Expire Or Not Valid Please Reload Page and Try Again!',
  })
  message: string;

  @ApiProperty({ example: 400 })
  statusCode: number;
}
