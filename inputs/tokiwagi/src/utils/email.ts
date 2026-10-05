import ejs from "ejs";
import moment from "moment";

import { BARCODE_IMG_CID, EMAIL_SETTING_KEY } from "constants/settings";
import { Booking, User } from "models/Entity";
import EmailService from "services/email.service";
import { SHORT_DATE } from "constants/common";
import { serverConfig } from "config";
import { generateBase64Barcode } from "utils/server/barcode";
import { getShortBarCode } from "utils/booking";
import { formatEmailTime } from "utils/date-time";

export const compileEmailContent = (template, data) => {
  return ejs.render(template, data, {
    openDelimiter: "{{",
    closeDelimiter: "}}",
  });
};

export const sendSystemCancelledNotificationEmail = (booking: Booking) => {
  EmailService.sendEmail([booking.User.email, booking.subEmail], EMAIL_SETTING_KEY.SYSTEM_CANCEL_BOOKING, {
    name: booking.User.name,
    booking: {
      ...booking,
      createdAt: moment(booking.createdAt).format(SHORT_DATE),
      date: moment(booking.date).format(SHORT_DATE),
      cancelledAt: moment().format(SHORT_DATE),
      Tenant: {
        ...booking.Tenant,
        openedAt: formatEmailTime(booking.Tenant.openedAt),
        closedAt: formatEmailTime(booking.Tenant.closedAt),
        servedUtil: formatEmailTime(booking.Tenant.servedUtil),
      },
    },
  });
};

export const sendSuccessfulRegisterUserEmail = (user: User) => {
  EmailService.sendEmail(user.email, EMAIL_SETTING_KEY.VERIFY_SUCCESSFUL, { name: user.name, link: serverConfig.external.url });
};

export const sendCallingNotificationEmail = async (booking: Booking) => {
  const name = booking.User.name;
  const barCode = booking.barCode;
  const date = moment(booking.date).format(SHORT_DATE);

  const barcodeBase64 = await generateBase64Barcode(barCode);

  const emailData = {
    name,
    date,
    barCode,
    barcodeImgSrc: barcodeBase64,
    barcodeImgTag: `<img src="cid:${BARCODE_IMG_CID}" alt="bar code" />`,
    shortBarCode: getShortBarCode(barCode),
    cid: BARCODE_IMG_CID,
    attachments: [
      {
        content: barcodeBase64.split("base64,")[1],
        encoding: "base64",
        cid: BARCODE_IMG_CID,
        filename: "barcode",
      },
    ],
  };

  EmailService.sendEmail([booking.User.email, booking.subEmail], EMAIL_SETTING_KEY.CALLING_NOTIFICATION, emailData);
};
