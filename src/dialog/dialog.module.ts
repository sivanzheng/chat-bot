import { Module } from '@nestjs/common'
import { DialogController } from 'src/dialog/dialog.controller'
import { LLMProvider } from 'src/LLM/llm.provider'

@Module({
    providers: [LLMProvider],
    controllers: [DialogController],
})
export class DialogModule {}
