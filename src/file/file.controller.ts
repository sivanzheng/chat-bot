import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import * as fs from 'fs'
import { Express } from 'express'
import { extname } from 'path'
import { v4 as uuidV4 } from 'uuid'

const FILE_EXTENSIONS = ['txt', 'pdf', 'json', 'csv']
const FILE_SIZE = 1024 * 1024 * 10

@Controller('file')
export class FileController {
    @Post('upload')
    @UseInterceptors(
        FileInterceptor('file', {
            fileFilter: (req, file, cb) => {
                const isValidFile = FILE_EXTENSIONS.includes(extname(file.originalname).substr(1))
                if (!isValidFile) {
                    return cb(new Error('Only txt, pdf, json or csv files are allowed!'), false)
                }
                cb(null, true)
            },
            limits: {
                fileSize: FILE_SIZE,
            },
        }),
    )
    uploadFile(
        @UploadedFile() file: Express.Multer.File,
    ) {
        const fileId = uuidV4()
        const fileName = `${fileId}${extname(file.originalname)}`
        const directory = 'static/docs'
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true })
        }
        fs.writeFileSync(`${directory}/${fileName}`, file.buffer)
        return { fileId }
    }
}
