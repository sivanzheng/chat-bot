import { Provider } from '@nestjs/common'
import { ChromaClient } from 'chromadb'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'

import { ConfigService } from '@nestjs/config'

export class VectorStore {
    private client: ChromaClient

    constructor(
        private readonly dbPath: string,
        private readonly apiKey: string,
        private readonly proxyPath: string,
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
        const embedder = new OpenAIEmbeddings(
            {},
            {
                apiKey: this.apiKey,
                basePath: this.proxyPath,
            },
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
        return new VectorStore(
            dbPath,
            apiKey,
            proxyPath,
        )
    },
}
