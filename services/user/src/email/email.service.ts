import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailParams, MailerSend, Recipient, Sender} from 'mailersend';


@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private mailerDomain: string;
  private mailerSend: MailerSend;
  private noReplySender: Sender;
  constructor(
    private readonly configService: ConfigService
  ) {
    this.mailerSend = new MailerSend({ apiKey: this.configService.get('mailerSend.apiKey') });
    this.mailerDomain = this.configService.get('mailerSend.domain');
    this.noReplySender = new Sender(`no-reply@${this.mailerDomain}`, "No reply");
  }

  async sendEmailByTemplateId(recipient: string, templateId: string, variable: object) {
    try {
      const recipients = [
        new Recipient(recipient)
      ];

      const variables = [{
        email: recipient,
        substitutions: Object.keys(variable).map((key) => ({ var: key, value: variable[key] }))
      }];

      const emailParams = new EmailParams()
        .setFrom(this.noReplySender)
        .setTo(recipients)
        .setVariables(variables)
        .setSubject("Email verification")
        .setTemplateId(templateId);

      const result = await this.mailerSend.email.send(emailParams);
      this.logger.verbose(result);
    } catch (e) {
      this.logger.error(e);
    }
  }
}
