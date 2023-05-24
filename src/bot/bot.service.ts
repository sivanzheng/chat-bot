import { Injectable } from '@nestjs/common'
import { HNSWLib } from 'langchain/vectorstores/hnswlib'
import { ConversationalRetrievalQAChain } from 'langchain/chains'

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

    async getAnswer(question: string) {
        let answer = ''
        const response = await this.chain.call({
            question,
            chat_history: answer.length > 0 ? answer : [],
        })
        answer += response.text
        return answer
    }
}
