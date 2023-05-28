import { Injectable } from '@nestjs/common'
import { BaseCallbackHandler } from 'langchain/callbacks'
import { HNSWLib } from 'langchain/vectorstores/hnswlib'
import { ConversationalRetrievalQAChain } from 'langchain/chains'
import { Observable } from 'rxjs'

import { createVectorStore, createChain } from './bot'

@Injectable()
export class BotService {
    private vectorStore: HNSWLib
    private chain: ConversationalRetrievalQAChain

    constructor() {
        this.initChain()
    }

    private async getVectorStore() {
        if (!this.vectorStore) {
            this.vectorStore = await createVectorStore()
        }
        return this.vectorStore
    }

    private async initChain() {
        if (!this.chain) {
            this.chain = await createChain(await this.getVectorStore())
        }
        return this.chain
    }

    getAnswer(
        question: string,
        history: string[] = [],
    ) {
        return new Observable<string>((subscriber) => {
            let isStuffDocumentsChain = false
            const handlers = BaseCallbackHandler.fromMethods({
                // being called when the chain is started
                handleChainStart(chain) {
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
            this.chain
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
