import { Module } from '@nestjs/common'
import { LLMProvider } from 'src/LLM/llm.provider'
import { ConfigProvider } from 'src/config/config.provider'
import { VectorStoreProvider } from 'src/vector-store/vector-store.provider'
import { DocumentController } from 'src/document/document.controller'

@Module({
    providers: [
        LLMProvider,
        ConfigProvider,
        VectorStoreProvider,
    ],
    exports: [VectorStoreProvider],
    controllers: [DocumentController],
})
export class DocumentModule {}
