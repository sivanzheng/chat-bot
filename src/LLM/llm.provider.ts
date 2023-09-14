import { Provider } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OpenAI } from 'langchain/llms/openai'
import { Document } from 'langchain/document'
import { Chroma } from 'langchain/vectorstores/chroma'
import { BufferMemory } from 'langchain/memory'
import {
    ConversationalRetrievalQAChain,
    LLMChain,
    loadQAChain,
} from 'langchain/chains'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'

import { JSONLoader } from 'langchain/document_loaders/fs/json'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { CSVLoader } from 'langchain/document_loaders/fs/csv'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'

import { Config } from 'src/config/config.interface'
import { CONDENSE_PROMPT, QA_PROMPT } from 'src/LLM/prompts'

import { getProxyParams } from 'src/utils'
import { VectorStore } from 'src/vector-store/vector-store.provider'

export class LLM {
    constructor(
        private readonly proxyPath: string,
        private readonly openaiApiKey: string,
        private readonly chromaDbPath: string,
        private readonly enableProxy: boolean,
        private readonly vectorStore: VectorStore,
    ) { }

    async loadDocument(
        blob: Blob,
        type: 'json' | 'txt' | 'csv' | 'pdf' | string,
    ) {
        switch (type) {
            case 'json': {
                const loader = new JSONLoader(blob)
                const docs = await loader.load()
                return docs
            }
            case 'txt': {
                const loader = new TextLoader(blob)
                const docs = await loader.load()
                return docs
            }
            case 'csv': {
                const loader = new CSVLoader(blob)
                const docs = await loader.load()
                return docs
            }
            case 'pdf': {
                const loader = new PDFLoader(blob)
                const docs = await loader.load()
                return docs
            }
            default: throw new Error('Invalid document type')
        }
    }

    async splitDocuments(docs: Document<Record<string, any>>[]) {
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        })

        const docOutput = await splitter.splitDocuments(docs)
        return docOutput
    }

    private async initChroma(collectionName: string) {
        const params = getProxyParams(this.enableProxy, this.proxyPath, this.openaiApiKey)
        const embeddings = new OpenAIEmbeddings(
            {},
            params,
        )
        const vectorStore = await Chroma.fromExistingCollection(
            embeddings,
            {
                collectionName,
                url: this.chromaDbPath,
            },
        )
        return vectorStore
    }

    private createChain = async (vectorStore: Chroma) => {
        const params = getProxyParams(this.enableProxy, this.proxyPath, this.openaiApiKey)
        const model = new OpenAI(
            {
                temperature: 0,
                streaming: true,
                modelName: 'gpt-3.5-turbo',
            },
            params,
        )
        const questionGenerator = new LLMChain({
            llm: model,
            prompt: CONDENSE_PROMPT,
        })
        const docChain = loadQAChain(
            model,
            {
                type: 'stuff',
                prompt: QA_PROMPT,
            },
        )

        const chain = ConversationalRetrievalQAChain.fromLLM(
            model,
            vectorStore.asRetriever(),
            {
                memory: new BufferMemory({
                    memoryKey: 'chat_history',
                    inputKey: 'question',
                    outputKey: 'text'
                }),
            },
        )
        chain.combineDocumentsChain = docChain
        chain.questionGeneratorChain = questionGenerator

        return chain
    }

    async initChain(collectionName: string) {
        const collection = await this.vectorStore.getCollection(collectionName)
        if (!collection) throw new Error('Collection does not exist')
        const chroma = await this.initChroma(collectionName)
        const chain = await this.createChain(chroma)
        return chain
    }
}

export const LLMProvider: Provider<LLM> = {
    provide: 'LLM',
    inject: [ConfigService],
    useFactory: (
        configService: ConfigService<Config>,
    ) => {
        const dbPath = configService.get<string>('chromaDbPath')
        const apiKey = configService.get<string>('openaiApiKey')
        const proxyPath = configService.get<string>('proxyPath')
        const enableProxy = configService.get<boolean>('enableProxy')

        const vectorStore = new VectorStore(
            dbPath,
            apiKey,
            proxyPath,
            enableProxy,
        )

        return new LLM(
            proxyPath,
            apiKey,
            dbPath,
            enableProxy,
            vectorStore,
        )
    },
}
