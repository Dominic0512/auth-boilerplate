import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { NotificationService } from './notification.service';

@Module({
  providers: [EmailService, NotificationService],
  // exports: [EmailService, NotificationService],
})
export class EmailModule {}