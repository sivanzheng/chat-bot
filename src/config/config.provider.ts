import { ConfigService } from '@nestjs/config'
import { Provider } from '@nestjs/common'
import { Config } from 'src/config/config.interface'

export const ConfigProvider: Provider<Config> = {
    provide: 'Config',
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
        const openaiApiKey = configService.get<string>('openaiApiKey')
        const enableProxy = configService.get<boolean>('enableProxy')
        if (!enableProxy) {
            process.env.OPENAI_API_KEY = openaiApiKey
        }
        return ({
            enableProxy,
            openaiApiKey,
            chromaDbPath: configService.get<string>('chromaDbPath'),
            proxyPath: configService.get<string>('proxyPath'),
        })
    },
}
