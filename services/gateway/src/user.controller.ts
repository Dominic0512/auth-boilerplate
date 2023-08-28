import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseInterceptors,
  Inject,
  Param,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ApiForbiddenException, ApiUnauthorizedException } from './common/swagger';
import { ApiBearAuthWithRoles } from './auth/auth.decorator';
import { RoleEnum } from './auth/auth.type';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ManipulateUserDto } from './dto/user.dto';


@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
  ) {}
  @Get()
  async list(): Promise<any> {
    return await firstValueFrom(this.userServiceClient.send('USER_LIST', {}));
  }

  @Get('/:id/profile')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBearAuthWithRoles([RoleEnum.Admin])
  @ApiUnauthorizedException()
  @ApiForbiddenException()
  async profile(@Param() { id }: ManipulateUserDto) {
    return await firstValueFrom(this.userServiceClient.send('USER_GET_BY_ID', { id }));
  }
}
