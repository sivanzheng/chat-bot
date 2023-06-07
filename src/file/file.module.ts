import { Module } from '@nestjs/common'
import { FileController } from 'src/file/file.controller'

@Module({
    controllers: [FileController],
})
export class FileModule {}
