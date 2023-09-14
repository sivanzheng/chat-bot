import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { LLMProvider } from 'src/LLM/llm.provider'
import { VectorStoreProvider } from 'src/vector-store/vector-store.provider'
import { DocumentController } from 'src/document/document.controller'

@Module({
    providers: [
        ConfigService,
        LLMProvider,
        VectorStoreProvider,
    ],
    exports: [VectorStoreProvider],
    controllers: [DocumentController],
})
export class DocumentModule {}
