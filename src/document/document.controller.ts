import {
    Controller,
    Body,
    Get,
    Post,
    Inject,
    Param,
    UseInterceptors,
    HttpException,
    HttpStatus,
} from '@nestjs/common'
import { v4 as uuidV4 } from 'uuid'
import * as fs from 'fs'
import * as path from 'path'
import { VectorStore } from 'src/vector-store/vector-store.provider'
import { LLM } from 'src/LLM/llm.provider'
import { ParseDocsDto } from 'src/document/document.dto'
import { TransformResponseInterceptor } from 'src/interceptors/transform-response.interceptor'

@Controller('document')
export class DocumentController {
    constructor(
        @Inject('VectorStore') private readonly vectorStore: VectorStore,
        @Inject('LLM') private readonly llm: LLM,
    ) {}

    @Get('list')
    @UseInterceptors(TransformResponseInterceptor)
    async getList() {
        const list = await this.vectorStore.listCollection()
        return list.map((item) => ({ id: item.id, name: item.name }))
    }

    @Get('delete/:collectionName')
    @UseInterceptors(TransformResponseInterceptor)
    async deleteCollection(
        @Param('collectionName') collectionName: string,
    ) {
        await this.vectorStore.deleteCollection(collectionName)
        return true
    }

    @Post('parse')
    @UseInterceptors(TransformResponseInterceptor)
    async parse(
        @Body() body: ParseDocsDto,
    ) {
        const { fileId, collectionName } = body
        const dirPath = 'static/docs'
        const files = fs.readdirSync(dirPath)
        const matchingFiles = files.filter((file) => file.startsWith(fileId))
        if (matchingFiles.length === 0) {
            throw new HttpException('File not found', HttpStatus.BAD_REQUEST)
        }
        const filePath = path.join(dirPath, matchingFiles[0])
        let file: Buffer
        try {
            file = fs.readFileSync(filePath)
        } catch (error) {
            throw new HttpException('File not found', HttpStatus.BAD_REQUEST)
        }
        const fileType = path.extname(filePath).substr(1)
        const docs = await this.llm.loadDocument(new Blob([file]), fileType)
        const splitDocs = await this.llm.splitDocuments(docs)

        const documents: string[] = []
        const ids: string[] = []
        const metadatas: Record<string, any>[] = []
        for (const doc of splitDocs) {
            const id = uuidV4()
            ids.push(id)
            documents.push(doc.pageContent)
            metadatas.push(doc.metadata)
        }

        const collection = await this.vectorStore.getCollection(collectionName)
        collection.add({
            ids,
            documents,
            metadatas,
        })
        const count = await collection.count()
        console.log(`${filePath} added to collection ${collectionName}, now contains ${count} documents`)

        fs.unlinkSync(filePath)
        return true
    }
}
