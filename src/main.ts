import { NestFactory } from '@nestjs/core'

import { AppModule } from 'src/app.module'
import { TransformExceptionFilter } from 'src/filters/transform-exception.filter'
import { TransformResponseInterceptor } from 'src/interceptors/transform-response.interceptor'

async function bootstrap() {
    const app = await NestFactory.create(
        AppModule,
        { forceCloseConnections: true },
    )
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    })
    app.enableShutdownHooks()
    app.useGlobalFilters(new TransformExceptionFilter())
    app.useGlobalInterceptors(new TransformResponseInterceptor())
    await app.listen(3000)
    console.log(`Application is running on: ${await app.getUrl()}`)
}
bootstrap()