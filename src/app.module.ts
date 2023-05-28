import { Module } from '@nestjs/common'
import { BotModule } from './bot/bot.module'
import { AppController } from './app.controller'

@Module({
    imports: [
        BotModule,
    ],
    controllers: [AppController],
    providers: [],
})
export class AppModule {}
