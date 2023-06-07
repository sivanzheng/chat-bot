import { Module } from '@nestjs/common'
import { ConfigProvider } from 'src/config/config.provider'
import { VectorStoreProvider } from 'src/vector-store/vector-store.provider'

@Module({
    providers: [
        ConfigProvider,
        VectorStoreProvider,
    ],
    exports: [VectorStoreProvider],
})
export class VectorStoreModule {}
