import { ConfigService } from '@nestjs/config'
import { Provider } from '@nestjs/common'
import { Config } from 'src/config/config.interface'

export const ConfigProvider: Provider<Config> = {
    provide: 'Config',
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
        chromaDbPath: configService.get<string>('chromaDbPath'),
        openaiApiKey: configService.get<string>('openaiApiKey'),
        proxyPath: configService.get<string>('proxyPath'),
    }),
}
