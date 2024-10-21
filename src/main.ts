import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

import { NestExpressApplication } from '@nestjs/platform-express';
import { useContainer } from 'class-validator';

import { CustomLoggerService } from './loggers/custom-logger.service';
import { setupSwagger } from './config/swagger.config';

const logger = new Logger('Application');

async function bootstrap() {
  const customLogger = new CustomLoggerService();
  customLogger.setLogLevels(['error', 'verbose', 'warn', 'debug']);

  //khởi tạo server với một số cài đặt như chỉ hiển thị logger cho toàn bộ ứng dụng gồm error, verbose, warn, debug
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: customLogger,
  });

  // bật cors cho ứng dụng và chấp nhận toàn bộ origin, chấp nhận cookie và trả về 204 status khi method là option
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production' ? ['https://melody-box.com'] : '*',
    credentials: true,
    optionsSuccessStatus: 204,
  });
  app.setGlobalPrefix('api');
  // cài đặt version cho ứng dụng
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: process.env.CURRENT_VERSION,
  });

  // dùng global pile để kiểm soát dữ liệu đầu vào cho body
  app.useGlobalPipes(
    new ValidationPipe({
      enableDebugMessages: true, // cho phép in mesasge khi debug
      whitelist: true, // chỉ cho phép các thuộc tính có trong dto
      errorHttpStatusCode: 400, // trả về mã lỗi khi dto sai - ở đây đặt là 400 (bad request)
      transform: true, // khi bật true thì dùng  thư viện class-transformer để chuyển đổi dữ liệu đầu vào , ví dụ: chuyển đổi chuỗi thành số,....
    }),
  );
  // Cấu hình class-validator sử dụng container Dependency Injection của NestJS
  // Điều này cho phép các custom validator trong class-validator có thể sử dụng các dịch vụ từ NestJS
  // Bằng cách này, có thể tiêm các providers hoặc services của NestJS vào các custom validator,
  // giúp chúng dễ dàng truy cập vào các tài nguyên như cơ sở dữ liệu, các module, hoặc các logic nghiệp vụ khác.
  // Tham số fallbackOnErrors: true sẽ đảm bảo rằng nếu container không thể tiêm một phụ thuộc nào đó,
  // nó sẽ quay về container mặc định để cố gắng giải quyết, giảm thiểu lỗi phát sinh do thiếu phụ thuộc.
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // thêm middleware cookieParser để có thể lấy cookie từ request
  app.use(cookieParser());
  // thêm middleware useBodyParser cho phép ứng dụng xử lý dữ liệu JSON từ HTTP Request
  //giúp phân tích cú pháp của dữ liệu từ body của yêu cầu và chuyển nó thành đối tượng JavaScript để có thể sử dụng trong ứng dụng.
  app.useBodyParser('json', {
    limit: '80mb', // dùng để thiết lập kích thước tối đa của body request mà body-parser sẽ chấp nhận, ở đây tối đa là 80MB
    type: 'application/json', // chỉ xử lý các yêu cầu có Content-Type là 'application/json'
  });
  setupSwagger(app);
  //khai báo port cho ứng dụng
  const port = process.env.PORT || 5555;
  await app.listen(port).then(() => {
    logger.verbose(`System running on port ${port}`);
  });
}
bootstrap();
