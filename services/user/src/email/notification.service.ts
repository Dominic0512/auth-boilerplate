import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from './email.service';
import { UserRegisterByPasswordEvent } from '../common/event/user.event';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  constructor(
    private emailService: EmailService
  ) {}

  @OnEvent(UserRegisterByPasswordEvent.eventName, { async: true })
  async handleUserRegisterByPasswordEvent({ payload }: UserRegisterByPasswordEvent) {
    const { email, name, link } = payload;
    await this.emailService.sendEmailByTemplateId(email, 'jpzkmgqnxe1g059v', {
      name,
      email,
      link
    });
    this.logger.verbose(`Receive ${UserRegisterByPasswordEvent.eventName} with ${payload.email}.`);
  }
}
