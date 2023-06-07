import { Module } from '@nestjs/common'
import { LLMProvider } from 'src/LLM/llm.provider'
import { ConfigProvider } from 'src/config/config.provider'

@Module({
    providers: [
        LLMProvider,
        ConfigProvider,
    ],
})
export class LLMModule {}
