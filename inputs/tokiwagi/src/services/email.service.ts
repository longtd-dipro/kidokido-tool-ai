import nodemailer, { Transporter } from "nodemailer";
import Email from "email-templates";
import * as aws from "@aws-sdk/client-ses";

import prisma from "utils/db";
import { ERROR_MESSAGES } from "constants/errors";
import { serverConfig } from "config";
import { compileEmailContent } from "utils/email";

type SendMailOptions = {
  title: string;
  content: string;
};

type RenderEmailContentHtmlParams = {
  emailKey: string;
  data: unknown;
  options: SendMailOptions;
};

class MailTransporter {
  private transporter: Transporter;

  constructor() {
    if (serverConfig.email.enable_aws_ses) {
      const ses = new aws.SES({
        apiVersion: "2010-12-01",
        region: "ap-northeast-1",
      });

      this.transporter = nodemailer.createTransport({
        SES: { ses, aws },
        sendingRate: 14, // max 14 messages/second
      });
    } else {
      this.transporter = nodemailer.createTransport(serverConfig.email.server);
    }
  }

  async sendEmail(to: string | string[], emailKey: string, data?: unknown, options?: SendMailOptions) {
    try {
      const { html, emailTitle } = (await this.renderEmailContentHtml({ emailKey, data, options })) || {};
      if (!html) return;
      const mailOptions = {
        from: serverConfig.email.from_email,
        to,
        subject: emailTitle,
        text: html,
        html: html,
        attachments: (data as any)?.attachments,
      };

      return this.executeSendMail(mailOptions);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async sendEmailWithPredefinedContent(to: string | string[], options?: SendMailOptions, data?: unknown) {
    return this.sendEmail(to, null, data, options);
  }

  async executeSendMail(mailOptions) {
    const _this = this;
    return new Promise((resolve, reject) => {
      _this.transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject(error);
        } else {
          resolve(info);
        }
      });
    });
  }

  async renderEmailContentHtml({ emailKey, data, options }: RenderEmailContentHtmlParams) {
    let content;
    let emailTitle;
    let internalErrorMessage;

    if (emailKey) {
      try {
        const emailSetting = await prisma.emailSetting.findUnique({
          where: { emailKey },
        });

        if (!emailSetting) {
          internalErrorMessage = ERROR_MESSAGES.EMAIL_TEMPLATE_NOT_FOUND;
          throw new Error(internalErrorMessage);
        }

        if (!emailSetting.active) return;

        content = emailSetting.content;
        emailTitle = emailSetting.title;
      } catch (error) {
        const errorMessage = internalErrorMessage || ERROR_MESSAGES.CAN_NOT_SEND_EMAIL;
        throw new Error(errorMessage);
      }
    } else {
      content = options?.content;
      emailTitle = options?.title;
    }

    const email = new Email({
      render: (content, data) => {
        return new Promise((resolve) => {
          let html = compileEmailContent(content, data);
          html = email.juiceResources(html);
          resolve(html);
        });
      },
    });

    const html = await email.render(content, { data });
    return { html, emailTitle };
  }
}

const EmailService = new MailTransporter();

export default EmailService;
