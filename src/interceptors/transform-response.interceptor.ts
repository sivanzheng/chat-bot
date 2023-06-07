import {
    BadGatewayException,
    CallHandler,
    Injectable,
    NestInterceptor,
    ExecutionContext,
} from '@nestjs/common'
import { Observable, catchError } from 'rxjs'
import { map } from 'rxjs/operators'
import { ApiResponse } from 'src/app.dto'

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse> {
        return next.handle().pipe(
            catchError((error) => {
                throw new BadGatewayException(error)
            }),
            map((data) => ({
                data,
                ok: true,
            })),
        )
    }
}
