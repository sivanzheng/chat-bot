import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { LLMProvider } from 'src/LLM/llm.provider'

@Module({
    providers: [
        LLMProvider,
        ConfigService,
    ],
})
export class LLMModule {}
