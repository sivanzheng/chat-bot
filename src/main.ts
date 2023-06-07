import { NestFactory } from '@nestjs/core'

import { AppModule } from 'src/app.module'

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
    await app.listen(3000)
    console.log(`Application is running on: ${await app.getUrl()}`)
}
bootstrap()
