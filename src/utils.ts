import { OpenAIEmbeddings } from 'langchain/embeddings/openai'

export const getProxyParams = (enableProxy: boolean, proxyPath: string, openaiApiKey: string) => {
    const params: ConstructorParameters<typeof OpenAIEmbeddings>[1] | undefined = enableProxy
        ? {
            basePath: proxyPath,
            apiKey: openaiApiKey,
        }
        : undefined
    return params
}
