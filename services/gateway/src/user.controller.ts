import {
  Controller,
  Get,
  Put,
  Patch,
  Inject,
  LiteralObject,
  Param,
  Body,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';

import {
  ApiForbiddenException,
  ApiUnauthorizedException,
} from './common/swagger';
import { ApiBearAuthWithRoles } from './auth/auth.decorator';
import { RoleEnum } from './auth/auth.type';

import {
  InternalUserDto,
  ManipulateUserDto,
  UserStatisticsDto,
  UpdateInternalUserDto,
  PartialUpdateInternalUserDto,
} from './dto/user.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
  ) {}

  @Get()
  @ApiBearAuthWithRoles([RoleEnum.Admin])
  @ApiOkResponse({
    type: InternalUserDto,
    isArray: true,
    description: 'Receive user list.',
  })
  @ApiUnauthorizedException()
  @ApiForbiddenException()
  async list(): Promise<InternalUserDto[]> {
    return (
      await firstValueFrom(this.userServiceClient.send('USER_LIST', {}))
    ).map((item: LiteralObject) => new InternalUserDto(item));
  }

  @Get('/statistics')
  @ApiBearAuthWithRoles([RoleEnum.Admin])
  @ApiOkResponse({
    type: UserStatisticsDto,
    description: 'Receive basic user statistics.',
  })
  @ApiUnauthorizedException()
  @ApiForbiddenException()
  async statistics(): Promise<UserStatisticsDto> {
    return new UserStatisticsDto(
      await firstValueFrom(this.userServiceClient.send('USER_STATISTICS', {})),
    );
  }

  @Get('/:id')
  @ApiBearAuthWithRoles([RoleEnum.Admin])
  @ApiOkResponse({
    type: InternalUserDto,
    isArray: true,
    description: 'Receive basic user information.',
  })
  @ApiUnauthorizedException()
  @ApiForbiddenException()
  async profile(@Param() { id }: ManipulateUserDto) {
    return new InternalUserDto(
      await firstValueFrom(
        this.userServiceClient.send('USER_GET_BY_ID', { id }),
      ),
    );
  }

  @Put('/:id')
  @ApiBearAuthWithRoles([RoleEnum.Admin])
  @ApiOkResponse({
    type: InternalUserDto,
    description: 'Whole user information is updated.',
  })
  @ApiUnauthorizedException()
  @ApiForbiddenException()
  async update(
    @Param() { id }: ManipulateUserDto,
    @Body() updateInternalUserDto: UpdateInternalUserDto,
  ) {
    return new InternalUserDto(
      await firstValueFrom(
        this.userServiceClient.send('USER_UPDATE_BY_ID', {
          id,
          ...updateInternalUserDto,
        }),
      ),
    );
  }

  @Patch('/:id')
  @ApiBearAuthWithRoles([RoleEnum.Admin])
  @ApiOkResponse({
    type: InternalUserDto,
    description: 'Partial user information is updated.',
  })
  @ApiUnauthorizedException()
  @ApiForbiddenException()
  async partialUpdate(
    @Param() { id }: ManipulateUserDto,
    @Body() partialUpdateInternalUserDto: PartialUpdateInternalUserDto,
  ) {
    return new InternalUserDto(
      await firstValueFrom(
        this.userServiceClient.send('USER_UPDATE_BY_ID', {
          id,
          ...partialUpdateInternalUserDto,
        }),
      ),
    );
  }
}
