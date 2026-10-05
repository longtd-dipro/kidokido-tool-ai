import { Dialog, DialogContent } from "@mui/material";
import Image from "next/legacy/image";

import TriangleImage from "statics/images/triangle-pc.svg";
import { VACANCY_STATUS } from "constants/common";
import CloseIcon from "statics/images/close.svg";
import XImg from "statics/images/user/x-red.svg";
import OImg from "statics/images/user/circle-blue.svg";
import { TenantVacancy, TicketVacancy } from "models/Vacancy";

import InformationDialog from "../InformationDialog";

interface IDetailVacancyStatus {
  onDismiss: () => void;
  selectedTenantVacancy: TenantVacancy;
  nowDate: string;
  checkShouldHideTicketVacancy: (ticketVacancy: TicketVacancy) => boolean;
  showPopupDialog: (ticketVacancy: TicketVacancy) => void;
  isTicketFullOrNotAvailable: (ticketVacancy: TicketVacancy) => boolean;
  isShowPopupDialog: boolean;
  handleRedirect: () => void;
  hideFullDialog: () => void;
  selectedTicketVacancy: any;
}

export default function DetailVacancyDialog({
  onDismiss,
  selectedTenantVacancy,
  nowDate,
  checkShouldHideTicketVacancy,
  showPopupDialog,
  isTicketFullOrNotAvailable,
  isShowPopupDialog,
  handleRedirect,
  hideFullDialog,
  selectedTicketVacancy,
}: IDetailVacancyStatus) {
  return (
    <Dialog
      disablePortal
      open={true}
      onClose={onDismiss}
      aria-labelledby="responsive-dialog-title"
      className="xs:block max-w-[540px] xsup:w-full mx-auto xs:mx-5 "
    >
      <div className="flex flex-col items-center justify-center pt-[20px] px-[20px] pb-[40px] xs:pb-[20px] max-h-[30rem]">
        <div className="flex max-w-[500px] w-full flex-row items-start justify-end ">
          <Image src={CloseIcon} alt="close" onClick={onDismiss} className="cursor-pointer" />
        </div>
        <DialogContent className="!p-0 xs:min-w-[320px] min-w-full mt-4 xs:mt-0">
          {/* Heading */}
          <div className="xs:relative w-full flex items-center bg-[#FAFAFA]">
            <h2 className="p-4 border-r-[1px] border-solid border-white text-[#0068B7] work-break w-2/3 xs:w-1/2">{selectedTenantVacancy.tenantName}</h2>
            <span className="inline-flex justify-center grow text-[#0068B7]">{nowDate}</span>
          </div>
          <div className="flex w-full flex-col justify-center items-center mx-auto">
            {/* Body */}
            {selectedTenantVacancy.tickets?.map((item: any, key) =>
              checkShouldHideTicketVacancy(item) ? null : (
                <div key={key} className="w-full flex items-center border-l-[1px] border-b-[1px] border-r-[1px] border-[#D9D9D9]">
                  <h2 className="p-4 break-all border-r-[1px] border-solid border-[#D9D9D9] w-2/3 xs:w-1/2">{item.ticketName}</h2>
                  <span className="flex justify-center cursor-pointer grow">
                    {item.status === VACANCY_STATUS.FULL ? (
                      <Image src={TriangleImage} alt={"TriangleImage"} onClick={() => showPopupDialog(item)} />
                    ) : (
                      <Image
                        src={isTicketFullOrNotAvailable(item) ? XImg : OImg}
                        alt={isTicketFullOrNotAvailable(item) ? "x" : "o"}
                        onClick={() => showPopupDialog(item)}
                      />
                    )}
                  </span>
                </div>
              )
            )}

            {/* Show popup */}
            {isShowPopupDialog && (
              <InformationDialog
                onAccept={handleRedirect}
                onDismiss={hideFullDialog}
                message="現在の待ち時間"
                text="予約する"
                people={selectedTicketVacancy.waitingBookingsCount}
                minutes={selectedTicketVacancy.waitingTimeInMinutes}
                isShowButton={true}
              />
            )}
          </div>
        </DialogContent>
      </div>
    </Dialog>
  );
}
