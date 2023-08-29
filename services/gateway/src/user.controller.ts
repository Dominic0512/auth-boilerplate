import {
  Controller,
  Get,
  Inject,
  LiteralObject,
  Param,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';

import { ApiForbiddenException, ApiUnauthorizedException } from './common/swagger';
import { ApiBearAuthWithRoles } from './auth/auth.decorator';
import { RoleEnum } from './auth/auth.type';

import { ManipulateUserDto, UserDto, UserStatisticsDto } from './dto/user.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
  ) {}

  @Get()
  @ApiBearAuthWithRoles([RoleEnum.Admin])
  @ApiOkResponse({ type: UserDto, isArray: true, description: 'Receive user list.'})
  @ApiUnauthorizedException()
  @ApiForbiddenException()
  async list(): Promise<UserDto[]> {
    return (await firstValueFrom(this.userServiceClient.send('USER_LIST', {}))).map((item: LiteralObject) => new UserDto(item));
  }

  @Get('/statistics')
  @ApiBearAuthWithRoles([RoleEnum.Admin])
  @ApiOkResponse({ type: UserStatisticsDto, description: 'Receive basic user statistics.'})
  @ApiUnauthorizedException()
  @ApiForbiddenException()
  async statistics(): Promise<UserStatisticsDto> {
    return new UserStatisticsDto(await firstValueFrom(this.userServiceClient.send('USER_STATISTICS', {})));
  }

  @Get('/:id/profile')
  @ApiBearAuthWithRoles([RoleEnum.Admin])
  @ApiOkResponse({ type: UserDto, isArray: true, description: 'Receive basic user statistics.'})
  @ApiUnauthorizedException()
  @ApiForbiddenException()
  async profile(@Param() { id }: ManipulateUserDto) {
    return new UserDto(await firstValueFrom(this.userServiceClient.send('USER_GET_BY_ID', { id })));
  }
}
