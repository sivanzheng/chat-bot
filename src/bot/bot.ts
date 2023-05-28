import * as path from 'path'
import * as dotenv from 'dotenv'

import {
    LLMChain,
    loadQAChain,
    ConversationalRetrievalQAChain,
} from 'langchain/chains'
import { BufferMemory } from 'langchain/memory'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { HNSWLib } from 'langchain/vectorstores/hnswlib'
import { OpenAI } from 'langchain/llms/openai'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PromptTemplate } from 'langchain/prompts'

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

const CONDENSE_PROMPT = PromptTemplate.fromTemplate(`
    You should use chinese to answer the questions.
    Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

    Chat History:
    {chat_history}
    Follow Up Input: {question}
    Standalone question:`)

const QA_PROMPT = PromptTemplate.fromTemplate(`
    You should use chinese to answer the questions.
    You are a helpful AI assistant. Use the following pieces of context to answer the question at the end.
    If you don't know the answer, just say you don't know. DO NOT try to make up an answer.
    If the question is not related to the context,
    politely respond that you are tuned to only answer questions that are related to the context.
    
    {context}
    
    Question: {question}
    Helpful answer in markdown:`)

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
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    })

    const docOutput = await splitter.splitDocuments(docs)

    const embeddings = new OpenAIEmbeddings({
        timeout: 5000,
        maxRetries: 5,
        openAIApiKey: OPENAI_API_KEY,
    })
    const vectorStore = await HNSWLib.fromDocuments(
        docOutput,
        embeddings,
    )
    return vectorStore
}

export const createChain = async (vectorStore: HNSWLib) => {
    const model = new OpenAI(
        {
            temperature: 0.6,
            streaming: true,
            modelName: 'gpt-3.5-turbo',
            openAIApiKey: OPENAI_API_KEY,
        },
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

    const chain = new ConversationalRetrievalQAChain({
        retriever: vectorStore.asRetriever(1),
        combineDocumentsChain: docChain,
        questionGeneratorChain: questionGenerator,
        verbose: true,
    })

    // https://github.com/hwchase17/langchainjs/issues/1327
    chain.memory = new BufferMemory({
        inputKey: 'question',
    })

    return chain
}
