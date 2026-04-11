import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { databaseConstants } from "./constants";
import { validationExceptionFactory } from "./common/factories/validationException.factory";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            exceptionFactory: validationExceptionFactory
        }),
    );

    app.enableCors({
        origin: ["http://localhost:3000"],
        credentials: true,
    });

    await app.listen(databaseConstants.port ?? 3000);
}
bootstrap();
