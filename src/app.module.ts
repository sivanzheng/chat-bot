import { Module } from '@nestjs/common'
import { BotModule } from './bot/bot.module'

@Module({
    imports: [
        BotModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
