import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { createTransport, Transporter } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';
import { ConfigService } from '@nestjs/config';
import { MAIL_QUEUE } from './constants';

@Processor(MAIL_QUEUE, { concurrency: 1 })
export class EmailProcessor extends WorkerHost {
  private transporter: Transporter;
  constructor(private readonly configService: ConfigService) {
    super();
    this.transporter = createTransport({
      service: this.configService.get('MAIL_HOST'),
      port: 587,
      secure: false,
      auth: {
        user: this.configService.get('NODEMAILER_USER'),
        pass: this.configService.get('NODEMAILER_SECRET'),
      },
    });
  }

  async process(
    job: Job<{ to: string; subject: string; body: string }>,
  ): Promise<void> {
    const { to, subject, body } = job.data;
    const sender = `Music Gen <${this.configService.get('MAIL_SENDER')}>`;

    try {
      await this.transporter.sendMail({
        from: sender,
        to,
        subject,
        html: body,
      });
    } catch (error) {
      console.error('Error verifying transporter:', error);
      throw new Error('Email transporter verification failed');
    }

    console.log(`✅ Email sent to ${to}`);
  }
}
