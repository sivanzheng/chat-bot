import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common'

@Catch()
export class TransformExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const res = ctx.getResponse()

        const status = exception.getStatus()
        const statusCode = exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR
        const message = exception instanceof HttpException
            ? exception.message
            : 'Internal server error'

        let code = statusCode
        const exceptionRes = exception.getResponse()
        if (exceptionRes) {
            if (typeof exceptionRes === 'object') {
                const { status: exceptionCode } = exceptionRes as any
                if (exceptionCode) {
                    code = exceptionCode
                }
            }
        }

        res
            .status(status)
            .json({
                code,
                message,
                ok: false,
            })
    }
}
