import { Injectable, LiteralObject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";


@Injectable()
export class EmailService {
  private emailDomain: string;
  private provider: SESClient;
  constructor(
    private readonly configService: ConfigService
  ) {
    this.emailDomain = this.configService.get('core.emailDomain');
    this.provider = new SESClient({
      credentials: {
        accessKeyId: this.configService.get<string>('aws.accessKeyId'),
        secretAccessKey: this.configService.get<string>('aws.secretAccessKey'),
      },
      region: this.configService.get<string>('aws.region'),
    });
  }

  async sendEmail(recipient: string, variables: LiteralObject) {
    const { title, htmlContent } = variables;
    const params = {
      "Destination": {
        "ToAddresses": [
          recipient
        ]
      },
      "Message": {
        "Body": {
          "Html": {
            "Data": htmlContent
          }
        },
        "Subject": {
          "Data": title
        }
      },
      "Source": `no-reply@${this.emailDomain}`,
    };
    return await this.provider.send(new SendEmailCommand(params));
  }
}
