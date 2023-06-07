import {
    Controller,
    Inject,
    Query,
    Sse,
    BadRequestException,
    UseInterceptors,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { BaseCallbackHandler } from 'langchain/callbacks'
import { ConversationalRetrievalQAChain } from 'langchain/chains'
import { LLM } from 'src/LLM/llm.provider'
import { TransformResponseInterceptor } from 'src/interceptors/transform-response.interceptor'

@Controller('dialog')
export class DialogController {
    private chains: Map<string, ConversationalRetrievalQAChain> = new Map()

    constructor(
        @Inject('LLM') private readonly llm: LLM,
    ) {}

    @Sse()
    @UseInterceptors(TransformResponseInterceptor)
    async ask(
        @Query('topic') topic: string,
        @Query('question') question: string,
        @Query('history') history: string[],
    ) {
        if (!topic) {
            throw new BadRequestException('Topic is required')
        }
        let qaChain = this.chains.get(topic)
        if (!qaChain) {
            qaChain = await this.llm.initChain(topic)
        }
        return new Observable<string>((subscriber) => {
            let isStuffDocumentsChain = false
            const handlers = BaseCallbackHandler.fromMethods({
                // being called when the chain is started
                handleChainStart(chain) {
                    // https://github.com/hwchase17/langchainjs/issues/754
                    if (chain.name === 'stuff_documents_chain') {
                        isStuffDocumentsChain = true
                    }
                },
                // _prompts is the related prompts for the question
                handleLLMStart(llm, _prompts: string[]) {},
                handleLLMNewToken(token) {
                    if (isStuffDocumentsChain) {
                        subscriber.next(token)
                    }
                },
                handleChainEnd() {
                    isStuffDocumentsChain = false
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
