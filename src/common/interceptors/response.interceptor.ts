import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((res) => {
        // Hindari double-wrap jika controller sudah mengembalikan format envelope
        if (res && res.statusCode && res.message) {
          return res;
        }

        const statusCode = context.switchToHttp().getResponse().statusCode;
        return {
          statusCode,
          message: 'Success',
          data: res,
        };
      }),
    );
  }
}
