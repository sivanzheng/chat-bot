import { Module } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import { ConfigModule } from '@nestjs/config'
import { TransformExceptionFilter } from 'src/filters/transform-exception.filter'
import { LLMModule } from 'src/LLM/llm.module'
import { AppController } from 'src/app.controller'
import { DialogModule } from 'src/dialog/dialog.module'
import { DocumentModule } from 'src/document/document.module'
import { VectorStoreModule } from 'src/vector-store/vector-store.module'
import { FileModule } from 'src/file/file.module'

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: ['.env'],
            isGlobal: true,
            load: [() => ({
                proxyPath: process.env.PROXY_PATH,
                openaiApiKey: process.env.OPENAI_API_KEY,
                chromaDbPath: process.env.CHROMA_DB_PATH,
            })],
        }),
        LLMModule,
        DialogModule,
        DocumentModule,
        FileModule,
        VectorStoreModule,
    ],
    controllers: [AppController],
    providers: [
        {
            provide: APP_FILTER,
            useClass: TransformExceptionFilter,
        },
    ],
})
export class AppModule {}
