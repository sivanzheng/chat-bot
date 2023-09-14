import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { VectorStoreProvider } from 'src/vector-store/vector-store.provider'

@Module({
    providers: [
        ConfigService,
        VectorStoreProvider,
    ],
    exports: [VectorStoreProvider],
})
export class VectorStoreModule {}
