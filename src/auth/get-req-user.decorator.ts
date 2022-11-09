import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetReqUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const user = ctx.switchToHttp().getRequest().user;

    if (!user) {
      return null;
    }

    return data ? user[data] : user; // extraer propiedad especifica o el objeto de account entero
  },
);
