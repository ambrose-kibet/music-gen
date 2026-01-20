import { Injectable } from '@nestjs/common';
import { SendMailDto } from './Dtos/send-mail.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MAIL_JOB, MAIL_QUEUE } from './constants';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    @InjectQueue(MAIL_QUEUE) private readonly emailQueue: Queue,
    private readonly configService: ConfigService,
  ) {}
  async sendMail(sendMailDto: SendMailDto) {
    await this.emailQueue.add(MAIL_JOB, sendMailDto, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }

  populateVerificationEmailTemplate({
    name,
    token,
    code,
    type,
  }: {
    name: string;
    token?: string;
    code?: string;
    type: 'verify' | 'reset';
  }): string {
    const year = new Date().getFullYear();
    return `
    <html>
    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <title>Email Confirmation</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
        href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
        rel="stylesheet"
        />
        <style>
        @media screen and (max-width: 600px) {
            .content {
            width: 100% !important;
            display: block !important;
            padding: 10px !important;
            }
            .header,
            .body,
            .footer {
            padding: 20px !important;
            }
        }
        </style>
    </head>
        <body style="font-family: 'Poppins', Arial, sans-serif">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
            <td align="center" style="padding: 20px">
            <table
                class="content"
                width="600"
                border="0"
                cellspacing="0"
                cellpadding="0"
                style="border-collapse: collapse; border: 1px solid #cccccc"
            >
                <!-- Header --> 
                <tr>
                <td
                    class="header"
                    style="
                    background-color: #16a34a;
                    padding: 40px;
                    text-align: center;
                    color: white;
                    font-size: 24px;
                    "
                >
                   ${type === 'verify' ? 'Verify Your Email' : 'Reset Your Password'}
                </td>
                </tr>

                <!-- Body -->
                <tr>
                <td
                    class="body"
                    style="
                    padding: 40px;
                    text-align: left;
                    font-size: 16px;
                    line-height: 1.6;
                    "
                >
                    Hello, ${name} <br />
                    ${type === 'verify' ? 'We are excited to have you on board.' : 'You requested a password reset.'} <br />
                    <br />

                    ${type === 'verify' ? 'To start exploring the platform, please verify your email address.' : 'To reset your password, .'}
                    <br />
                    ${type === 'verify' ? 'Use the code below to verify your email address.' : 'Click the link below to reset your password.'}
                    <br />
                    <br />
                    This ${type === 'verify' ? 'code' : 'link'} will expire in 1 hour. <br />
                </td>
                </tr>

                <!-- Call to action Button -->
                <tr>
                <td style="padding: 0px 40px 0px 40px; text-align: center">
                    <!-- CTA Button -->
                    <table cellspacing="0" cellpadding="0" style="margin: auto">
                    <tr>
                        <td
                        align="center"
                        style="
                            background-color: #16a34a;
                            padding: 10px;
                            border-radius: 5px;
                            max-width: 800px;
                            display: block;
                            width: 100%;
                            margin-bottom: 20px;
                        "
                        >
                       ${
                         token
                           ? ` <a
                            href="${this.configService.get(
                              'CLIENT_URL',
                            )}/auth/reset-password?token=${token}"
                            style="
                            color: #ffffff;
                            text-decoration: none;
                            font-weight: bold;
                            width: 100%;
                            font-size: 24px;
                            margin: 0px;
                            padding: 0px;
                            text-decoration: none;
                            "
                        >
                        Verify Email
                        </a>`
                           : `
                        <h2
                           
                            style="
                            color: #ffffff;
                            text-decoration: none;
                            font-weight: bold;
                            width: 100%;
                            font-size: 24px;
                            margin: 0px;
                            padding: 0px;
                            text-decoration: none;
                            "
                        >
                        ${code}
                        </h2>                  
                        `
                       }
                        </td>
                    </tr>
                    </table>
                </td>
                </tr>
                <!-- Footer -->
                <tr>
                <td
                    class="footer"
                    style="
                    background-color: #16a34a;
                    padding: 40px;
                    text-align: center;
                    color: white;
                    font-size: 14px;
                    "
                >
                    Copyright &copy; ${year} MusicGen. All rights reserved.
                </td>
                </tr>
            </table>
            </td>
        </tr>
        </table>
        </body>
</html>

    `;
  }

  populateNotificationEmailTemplate({
    name,
    message,
    title,
  }: {
    name: string;
    title: string;
    message: string;
  }): string {
    const year = new Date().getFullYear();
    return `
    <html>
    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <title>Notification Email</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
        href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
        rel="stylesheet"
        />
        <style>
        @media screen and (max-width: 600px) {
            .content {
            width: 100% !important;
            display: block !important;
            padding: 10px !important;
            }
            .header,
            .body,
            .footer {
            padding: 20px !important;
            }
        }
        </style>
    </head>
        <body style="font-family: 'Poppins', Arial, sans-serif">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
            <td align="center" style="padding: 20px">
            <table
                class="content"
                width="600"
                border="0"
                cellspacing="0"
                cellpadding="0"
                style="border-collapse: collapse; border: 1px solid #cccccc"
            >
                <!-- Header --> 
                <tr>
                <td
                    class="header"
                    style="
                    background-color: #16a34a;
                    padding: 40px;
                    text-align: center;         
                    color: white;
                    font-size: 24px;
                    "
                >
                   ${title}
                </td>
                </tr>

                <!-- Body -->
                <tr>
                <td
                    class="body"
                    style="
                    padding: 40px;
                    text-align: left;
                    font-size: 16px;
                    line-height: 1.6;
                    "
                >
                    Hello, ${name} <br />
                    ${message}
                    <br />
                </td>
                </tr>

                <!-- Footer -->
                <tr>
                <td
                    class="footer"
                    style="
                    background-color: #16a34a;
                    padding: 40px;
                    text-align: center;
                    color: white;
                    font-size: 14px;
                    "
                >   

                Copyright &copy; ${year} MusicGen. All rights reserved.
                </td>
                </tr>
            </table>
            </td>
        </tr>
        </table>
        </body>
</html>

    `;
  }
}
