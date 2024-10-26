import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';

type EmailType =
  | 'FORGET_PASSWORD_JWT'
  | 'FORGET_PASSWORD_OTP'
  | 'EMAIL_SIGNUP_OTP';

interface EmailOptions {
  identity: string; // Identitiy refers to how we address the user in emails. It can be: first name, email, username, ..etc
  email: string;
  senderName: string;
  subject: string;
  jwt?: {
    token: string;
    redirectLink: string;
  };
  otp?: string;
}

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    host: `${process.env.NODEMAILER_HOST}`,
    secure: false, // true for port 456    false for port 25
    port: `${process.env.NODEMAILER_PORT}`, // 465 >> secure SSL/TLS   25 >> Unsecure
    auth: {
      user: `${process.env.NODEMAILER_EMAIL}`,
      pass: `${process.env.NODEMAILER_PASS}`,
    },
    tls: {
      ciphers: 'SSLv3',
    },
  });

  private mailGenerator(
    emailType: EmailType,
    {
      identity, // Identity refers to how we address the user in emails. It can be: first name, email, username, ..etc
      email,
      subject,
      senderName,
      jwt,
      otp,
    }: EmailOptions,
  ) {
    let generatedEmailTemplate = '';

    if (emailType === 'EMAIL_SIGNUP_OTP') {
      if (!otp)
        throw new InternalServerErrorException(
          'Cannot generate otp email template',
        );

      generatedEmailTemplate = this.SignUpEmailVerificationOtpTemplate(otp);
    }
    return {
      from: {
        name: senderName,
        address: `localhost:3000`,
      },
      to: email,
      subject: subject,
      html: generatedEmailTemplate,
    };
  }

  async sendEmail(emailType: EmailType, emailOptions: EmailOptions) {
    const mail = this.mailGenerator(emailType, emailOptions);

    try {
      await this.transporter.sendMail(mail);
    } catch (error) {
      throw new ServiceUnavailableException(`Failed to send email: ${error}`);
    }
  }

  private SignUpEmailVerificationOtpTemplate(otp: string): string {
    return `
      <head>
        <title>Idea</title>
        <style>
        body {
          color: blue;
        }
        h1 {
          color: #ff5050;
        }
        p {
          color: black
        }
      </style>
      </head>
      <body>
          <h1>Idea Account Registration</h1>
          <p>Your verification code is ${otp}
          In order to complete the registration process you will need to provide this code.</p>
          <p>Best regards, Idea Development Team.</p>
      </body>
      `;
  }
}
