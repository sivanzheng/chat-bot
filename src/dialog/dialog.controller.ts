import {
    Controller,
    HttpException,
    HttpStatus,
    Inject,
    Query,
    Sse,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { BaseCallbackHandler } from 'langchain/callbacks'
import { ConversationalRetrievalQAChain } from 'langchain/chains'
import { LLM } from 'src/LLM/llm.provider'

@Controller('dialog')
export class DialogController {
    private chains: Map<string, ConversationalRetrievalQAChain> = new Map()

    constructor(
        @Inject('LLM') private readonly llm: LLM,
    ) {}

    @Sse()
    async ask(
        @Query('topic') topic: string,
        @Query('question') question: string,
        @Query('history') history: string[],
    ) {
        if (!topic) {
            throw new HttpException('Topic is required', HttpStatus.BAD_REQUEST)
        }
        let qaChain = this.chains.get(topic)
        if (!qaChain) {
            try {
                qaChain = await this.llm.initChain(topic)
                this.chains.set(topic, qaChain)
            } catch (error) {
                throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
            }
        }
        return new Observable<string>((subscriber) => {
            const handlers = BaseCallbackHandler.fromMethods({
                handleLLMNewToken(token) {
                    subscriber.next(token)
                },
            })
            qaChain
                .call(
                    {
                        question,
                        chat_history: history,
                    },
                    [handlers],
                )
                .catch((err) => {
                    subscriber.error(err)
                })
                .finally(() => {
                    subscriber.complete()
                })
        })
    }
}
