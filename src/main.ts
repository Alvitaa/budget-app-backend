import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { databaseConstants } from "./constants";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );
    await app.listen(databaseConstants.port ?? 3000);
}
bootstrap();
