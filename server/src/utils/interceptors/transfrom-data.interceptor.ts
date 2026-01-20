import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { map } from 'rxjs';
import * as classTransformer from 'class-transformer';

export function SerializeData<T>(
  classType: classTransformer.ClassConstructor<T>,
) {
  return UseInterceptors(new TransformDataInterceptor(classType));
}

@Injectable()
export class TransformDataInterceptor implements NestInterceptor {
  constructor(
    private readonly classToUse: classTransformer.ClassConstructor<unknown>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data) => {
        return classTransformer.plainToInstance(this.classToUse, data);
      }),
    );
  }
}
