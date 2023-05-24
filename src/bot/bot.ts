import * as path from 'path'
import * as dotenv from 'dotenv'

import { ConversationalRetrievalQAChain, VectorDBQAChain } from 'langchain/chains'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { BufferMemory } from 'langchain/memory'
import { HNSWLib } from 'langchain/vectorstores/hnswlib'
import { OpenAI } from 'langchain/llms/openai'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'

import { DirectoryLoader } from 'langchain/document_loaders/fs/directory'
import {
    JSONLoader,
    JSONLinesLoader,
} from 'langchain/document_loaders/fs/json'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { CSVLoader } from 'langchain/document_loaders/fs/csv'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'

const envConfig = dotenv.config({ path: path.join(process.cwd(), '.env') })
const OPENAI_API_KEY = envConfig.parsed?.OPENAI_API_KEY || ''
console.log(OPENAI_API_KEY)

export const createVectorStore = async (): Promise<HNSWLib> => {
    const loader = new DirectoryLoader(
        path.join(process.cwd(), './static/docs/'),
        {
            '.json': (p) => new JSONLoader(p),
            '.jsonl': (p) => new JSONLinesLoader(p, '/html'),
            '.txt': (p) => new TextLoader(p),
            '.csv': (p) => new CSVLoader(p),
            '.pdf': (p) => new PDFLoader(p),
        },
    )
    const docs = await loader.load()
    console.log('docs loaded')
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 100,
        chunkOverlap: 0,
    })

    const docOutput = await splitter.splitDocuments(docs)

    const embeddings = new OpenAIEmbeddings({
        timeout: 5000,
        maxRetries: 5,
    })
    const vectorStore = await HNSWLib.fromDocuments(
        docOutput,
        embeddings,
    )
    console.log('vector store launched')
    return vectorStore
}

export const createChain = async (vectorStore: HNSWLib) => {
    const model = new OpenAI(
        {
            openAIApiKey: OPENAI_API_KEY,
            temperature: 0.6,
        },
    )
    console.log('model launched')

    const chain = ConversationalRetrievalQAChain.fromLLM(
        model,
        vectorStore.asRetriever(),
    )

    const vectorChain = VectorDBQAChain.fromLLM(
        model,
        vectorStore,
        {
            returnSourceDocuments: true,
        },
    )
    vectorChain.memory = new BufferMemory()
    return chain
}
