import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { Inject, Injectable } from '@nestjs/common';
import { AWS_SES_CLIENT } from '../constants';
import { ISendEmail } from '../interfaces/send-email.interface';
import { AppConfig } from 'src/common/services';

@Injectable()
export class AwsSESService {
  constructor(
    @Inject(AWS_SES_CLIENT) private sesClient: SESClient,
    private appConfig: AppConfig,
  ) {}

  async sendEmail({
    emails,
    body,
    template,
    subject,
  }: ISendEmail): Promise<void> {
    const command = new SendEmailCommand({
      Destination: {
        ToAddresses: Array.isArray(emails) ? emails : [emails],
      },
      Message: {
        Body: {
          ...(template && {
            Html: {
              Charset: 'UTF-8',
              Data: template,
            },
          }),
          ...(body && {
            Text: {
              Charset: 'UTF-8',
              Data: body,
            },
          }),
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
      },
      Source: 'challenge <info@task.co>',
    });

    await this.sesClient.send(command);
  }
}
