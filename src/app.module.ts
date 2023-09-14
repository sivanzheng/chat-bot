import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { LLMModule } from 'src/LLM/llm.module'
import { AppController } from 'src/app.controller'
import { DialogModule } from 'src/dialog/dialog.module'
import { DocumentModule } from 'src/document/document.module'
import { VectorStoreModule } from 'src/vector-store/vector-store.module'
import { FileModule } from 'src/file/file.module'
import { Config } from 'src/config/config.interface'

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: ['.env'],
            isGlobal: true,
            load: [(): Config => ({
                proxyPath: process.env.PROXY_PATH,
                openaiApiKey: process.env.OPENAI_API_KEY,
                chromaDbPath: process.env.CHROMA_DB_PATH,
                enableProxy: process.env.ENABLE_PROXY === 'true',
            })],
        }),
        LLMModule,
        DialogModule,
        DocumentModule,
        FileModule,
        VectorStoreModule,
    ],
    controllers: [AppController],
})
export class AppModule {}
