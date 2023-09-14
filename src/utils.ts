import { OpenAIEmbeddings } from 'langchain/embeddings/openai'

export const getProxyParams = (enableProxy: boolean, proxyPath: string, openaiApiKey: string): ConstructorParameters<typeof OpenAIEmbeddings>[1] | undefined => {
    const params = enableProxy
        ? {
            basePath: proxyPath,
            apiKey: openaiApiKey,
        }
        : undefined
    return params
}
