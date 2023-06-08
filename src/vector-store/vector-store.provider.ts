import { Provider } from '@nestjs/common'
import { ChromaClient } from 'chromadb'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'

import { ConfigService } from '@nestjs/config'
import { getProxyParams } from 'src/utils'

export class VectorStore {
    private client: ChromaClient

    constructor(
        private readonly dbPath: string,
        private readonly apiKey: string,
        private readonly proxyPath: string,
        private readonly enableProxy: boolean,
    ) {
        this.init()
    }

    private init() {
        this.client = new ChromaClient({
            path: this.dbPath,
        })
    }

    get instance() {
        return this.client
    }

    createCollection(name: string) {
        return this.client.createCollection({
            name,
            embeddingFunction: { generate: (texts: string[]) => this.generateEmbedding(texts) },
        })
    }

    getCollection(name: string) {
        return this.client.getOrCreateCollection({
            name,
            embeddingFunction: { generate: (texts: string[]) => this.generateEmbedding(texts) },
        })
    }

    listCollection() {
        return this.client.listCollections()
    }

    deleteCollection(name: string) {
        return this.client.deleteCollection({ name })
    }

    private async generateEmbedding(texts: string[]) {
        const params = getProxyParams(this.enableProxy, this.proxyPath, this.apiKey)
        const embedder = new OpenAIEmbeddings(
            {},
            params,
        )
        return embedder.embedDocuments(texts)
    }
}

export const VectorStoreProvider: Provider<VectorStore> = {
    provide: 'VectorStore',
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
        const dbPath = configService.get<string>('chromaDbPath')
        const apiKey = configService.get<string>('openaiApiKey')
        const proxyPath = configService.get<string>('proxyPath')
        const enableProxy = configService.get<boolean>('enableProxy')
        return new VectorStore(
            dbPath,
            apiKey,
            proxyPath,
            enableProxy,
        )
    },
}
