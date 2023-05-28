import {
    Controller,
    Query,
    Sse,
} from '@nestjs/common'
import { BotService } from './bot.service'

@Controller('bot')
export class BotController {
    constructor(private readonly appService: BotService) { }

    @Sse('ask')
    async ask(
        @Query('question') question: string,
        @Query('history') history: string[],
    ) {
        const responseSubject = this.appService.getAnswer(question, history)
        return responseSubject
    }
}
