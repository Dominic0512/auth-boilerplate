import {
  Controller,
  Get,
  Inject,
  LiteralObject,
  Param,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';

import { ApiForbiddenException, ApiUnauthorizedException } from './common/swagger';
import { ApiBearAuthWithRoles } from './auth/auth.decorator';
import { RoleEnum } from './auth/auth.type';

import { ManipulateUserDto, UserDto } from './dto/user.dto';


@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
  ) {}

  @Get()
  async list(): Promise<UserDto> {
    return (await firstValueFrom(this.userServiceClient.send('USER_LIST', {}))).map((item: LiteralObject) => new UserDto(item));
  }

  @Get('/:id/profile')
  @ApiBearAuthWithRoles([RoleEnum.Admin])
  @ApiUnauthorizedException()
  @ApiForbiddenException()
  async profile(@Param() { id }: ManipulateUserDto) {
    return new UserDto(await firstValueFrom(this.userServiceClient.send('USER_GET_BY_ID', { id })));
  }
}
