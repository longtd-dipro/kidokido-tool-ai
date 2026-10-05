import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import Image from "next/legacy/image";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";

import CloseIcon from "statics/images/close.svg";
import Button from "components/common/Buttons/Button";
import DisclaimerTermsCheckboxGroup from "components/CreateBooking/DisclaimerTermsCheckboxGroup";
import { checkDoesAgreeAllTerms, transformDisclaimerTermDefaultValue } from "utils/booking";
import { Disclaimer } from "models/Entity";
import ScrollGif from "statics/images/scroll.gif";

import styles from "./scroll-down.module.scss";

interface Props {
  defaultDisclaimers: Disclaimer[];
  onAccept: any;
  onDismiss: any;
}

export default function DisclaimerTermsCheckboxDialog({ defaultDisclaimers, onAccept, onDismiss }: Props) {
  const [isShowScrollHint, setIsShowScrollHint] = useState(true);
  const dialogContentRef = useRef<HTMLDivElement>(null);
  const handleScroll = () => {
    const isScrolled = dialogContentRef.current && dialogContentRef.current.scrollTop > 0;
    setIsShowScrollHint(!isScrolled);
  };

  useEffect(() => {
    const dialogContent = dialogContentRef.current;
    if (dialogContent) {
      dialogContent.addEventListener("scroll", handleScroll);
      return () => {
        dialogContent.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  const methods = useForm({
    defaultValues: transformDisclaimerTermDefaultValue(defaultDisclaimers),
  });

  const { control, watch } = methods;

  const { fields } = useFieldArray({
    control,
    name: "disclaimers",
  });

  const disclaimersValue = watch("disclaimers");
  const doesAgreeAllTerms = checkDoesAgreeAllTerms(disclaimersValue);

  return (
    <Dialog
      disablePortal
      open={true}
      onClose={onDismiss}
      aria-labelledby="responsive-dialog-title"
      className="mx-auto xs:mx-5 text-color disclaimerTermCheckboxes w-[640px] xs:w-[335px]"
    >
      <div className="flex w-full items-start justify-end pt-[20px] px-[20px]">
        <Image src={CloseIcon} alt="close" onClick={onDismiss} className="cursor-pointer" />
      </div>
      <DialogTitle className="text-2xl font-medium text-center responsive-dialog-title xs:text-bas">あそび場にご入場される保護者の皆さまへ</DialogTitle>

      <DialogContent ref={dialogContentRef} className="mt-2 relative">
        <div className={`${isShowScrollHint && "xs:block"} ${styles.scrolldown} hidden`}>
          <Image src={ScrollGif} width={50} height={50} alt="scrollGif"/> 
        </div>
        <FormProvider {...methods}>
          {fields.map((item, index) => (
            <DisclaimerTermsCheckboxGroup groupIndex={index} key={item.id} />
          ))}
        </FormProvider>
      </DialogContent>
      <DialogActions className="!flex !justify-center mb-4">
        <Button
          variant="contained"
          onClick={onAccept}
          className={`w-[300px] h-[64px] xs:h-[48px] xs:w-[200px] xs:!text-lg ${!doesAgreeAllTerms ? "disabled" : ""}`}
          disabled={!doesAgreeAllTerms}
        >
          予約する
        </Button>
      </DialogActions>
    </Dialog>
  );
}
