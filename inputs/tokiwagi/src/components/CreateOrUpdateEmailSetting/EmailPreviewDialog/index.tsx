import { Dialog, DialogActions, DialogContent } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import Image from "next/legacy/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { LoadingButton } from "@mui/lab";
import { useDispatch } from "react-redux";

import Button from "components/common/Buttons/Button";
import CloseIcon from "statics/images/close.svg";
import Error from "components/common/Error";
import { getPreviewEmailContent, sendPreviewEmail } from "services/api-client/admin/email-setting.service";
import Spinner from "components/common/Spinner";
import TextInputField from "components/common/Fields/TextInputField";
import Label from "components/common/Admin/Label";
import { emailSchema } from "libs/validation/schemas";
import { NotificationType, showNotification } from "stores/reducers/notification";
import { MESSAGES } from "constants/messages";
import { Barcode } from "components/common/Barcode";
import { FAKE_BARCODE } from "constants/email-template";
import { checkIsRenderBarCodeImage } from "utils/email-setting";

type Props = {
  emailKey: string;
  title: string;
  htmlEmailContent: string;
  onClose: () => void;
};

type FormData = {
  email: string;
};

export default function EmailPreviewDialog({ emailKey, title, htmlEmailContent, onClose }: Props) {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errMsg, setErrMsg] = useState<string>();
  const [previewEmailContent, setPreviewEmailContent] = useState<string>();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(emailSchema),
  });

  useEffect(() => {
    fetchPreviewEmailContent();
  }, []);

  const fetchPreviewEmailContent = async () => {
    try {
      setErrMsg("");
      setIsLoading(true);
      const res = await getPreviewEmailContent(htmlEmailContent, emailKey);
      setPreviewEmailContent(res);
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      setErrMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setErrMsg("");
      setIsSubmitting(true);
      await sendPreviewEmail({ email: data.email, emailKey, emailTitle: title, content: htmlEmailContent });
      dispatch(showNotification({ type: NotificationType.SUCCESS, message: MESSAGES.SEND_PREVIEW_EMAIL_SUCCESS }));
      onClose();
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      setErrMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      disablePortal
      open={true}
      onClose={onClose}
      aria-labelledby="responsive-dialog-title"
      className={`max-w-[${800}px] min-w-unset mx-auto md:mx-5`}
      PaperProps={{
        className: "!max-w-[unset]",
      }}
    >
      <div className="flex flex-col items-center gap-[28px] justify-center pt-[20px] px-[20px] pb-[40px] xs:pb-[20px]">
        <div className={`flex max-w-[${800}px] w-full flex-row items-start justify-end `}>
          <Image src={CloseIcon} alt="close" onClick={onClose} className="cursor-pointer" />
        </div>
        <DialogContent className="!py-0 w-full px-5">
          <Error message={errMsg} />
          <h4 className="font-medium text-[24px] leading-[32px] mb-6 text-center">{title}</h4>
          {isLoading ? (
            <div className="flex justify-center min-h-[50px]">
              <Spinner />
            </div>
          ) : (
            <form id="preview-form" onSubmit={handleSubmit(onSubmit)}>
              {/* Preview Content */}
              <div className="relative flex items-center mb-4">
                <Label className="text-base min-w-[140px]">
                  <span className="mr-2">本文</span>
                </Label>
                {previewEmailContent && (
                  <div>
                    <div
                      className="px-4 py-2 ad-bg rounded-lg grow max-h-[250px] overflow-y-scroll"
                      dangerouslySetInnerHTML={{ __html: previewEmailContent }}
                    ></div>
                    {checkIsRenderBarCodeImage(emailKey) && (
                      <div className="mt-2 flex justify-center">
                        <Barcode textsize={6} height={4} includeText={true} code={FAKE_BARCODE} />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="relative flex items-center">
                <Label className="text-base min-w-[140px]" isRequired={true}>
                  <span className="mr-2">指定メール</span>
                </Label>

                <TextInputField
                  name="email"
                  control={control}
                  inputProps={{ className: "ad-input-field px-4 py-3 font-medium", maxLength: 256 }}
                  className="w-full ad-input-field"
                />
              </div>
              <div className="flex items-center mt-2">
                <div className="min-w-[140px]"></div>
                {errors.email && <Error message={errors.email.message} />}
              </div>
            </form>
          )}
        </DialogContent>
        <DialogActions className="gap-4">
          <Button variant="outlined" onClick={onClose} className="!w-[200px] h-[56px] xs:!w-[120px] xs:h-[48px]">
            戻る
          </Button>
          <LoadingButton
            loading={isSubmitting}
            loadingPosition="end"
            variant="contained"
            type="submit"
            form="preview-form"
            className="!w-[200px] h-[56px] xs:!w-[120px] xs:h-[48px]"
          >
            送信
          </LoadingButton>
        </DialogActions>
      </div>
    </Dialog>
  );
}
