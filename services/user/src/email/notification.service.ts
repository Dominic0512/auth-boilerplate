import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from './email.service';
import { UserRegisterByPasswordEvent } from '../common/event/user.event';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private emailService: EmailService) {}

  @OnEvent(UserRegisterByPasswordEvent.eventName, { async: true })
  async handleUserRegisterByPasswordEvent({
    payload,
  }: UserRegisterByPasswordEvent) {
    this.logger.verbose(
      `Receive ${UserRegisterByPasswordEvent.eventName} with email: ${payload.email}`,
    );
    const { email, name, link } = payload;
    await this.emailService.sendEmail(email, {
      title: 'Please verify your email',
      htmlContent: `Hi ${name}, please click the link to complete the email verification process. <a class="ulink" href="${link}" target="_blank">Go to verify</a>.`,
    });
  }
}
