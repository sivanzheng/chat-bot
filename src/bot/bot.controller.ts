import {
    Body,
    Controller,
    Post,
} from '@nestjs/common'
import { BotService } from './bot.service'

@Controller()
export class BotController {
    constructor(private readonly appService: BotService) {

    }

    @Post('ask')
    async ask(@Body() body: { question: string }) {
        const { question } = body
        const answer = await this.appService.getAnswer(question)
        return answer
    }
}
