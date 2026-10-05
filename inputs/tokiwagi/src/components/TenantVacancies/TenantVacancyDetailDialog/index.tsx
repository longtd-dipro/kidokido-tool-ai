import { Dialog, DialogContent } from "@mui/material";
import Image from "next/legacy/image";
import * as React from "react";
import moment from "moment";

import CloseIcon from "statics/images/close.svg";
import XSmallImg from "statics/images/user/x-red-small.svg";
import OSmallImg from "statics/images/user/circle-blue-small.svg";
import OImg from "statics/images/user/circle-blue.svg";
import XImg from "statics/images/user/x-red.svg";
import { JP_SHORT_DATE, NOT_AVAILABLE_REASON } from "constants/common";
import { TenantVacancy, TicketVacancy } from "models/Vacancy";
import { isTicketVacancyFullOrNotAvailable } from "utils/vacancy-status";

export interface Props {
  onDismiss: () => void;
  selectedTenantVacancy: TenantVacancy;
  onClickOnlineTicketVacancy: (ticketVacancy: TicketVacancy) => void;
}

export default function TenantVacancyDetailDialog({ onDismiss, selectedTenantVacancy, onClickOnlineTicketVacancy }: Props) {
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
          <div className="flex flex-col justify-center items-center mx-auto">
            {/* Heading */}
            <div className="xs:relative w-full flex items-center bg-[#FAFAFA]">
              <h2 className="p-4 border-r-[1px] border-solid border-white text-[#0068B7] work-break w-2/3 xs:w-1/2">{selectedTenantVacancy.tenantName}</h2>
              <span className="inline-flex justify-center grow text-[#0068B7]">{moment(selectedTenantVacancy.date).format(JP_SHORT_DATE)}</span>
            </div>

            {/* Body */}
            <div className="flex flex-col justify-center items-center mx-auto w-full">
              {selectedTenantVacancy.tickets
                ?.filter((item) => item.reason !== NOT_AVAILABLE_REASON.NO_BOOKING_SCHEDULE)
                .map((item: TicketVacancy) => {
                  return (
                    <div key={item.ticketId} className="w-full flex items-center border-l-[1px] border-b-[1px] border-r-[1px] border-[#D9D9D9]">
                      <h2 className="p-4 break-all border-r-[1px] border-solid border-[#D9D9D9] w-2/3 xs:w-1/2">{item.ticketName}</h2>
                      {/* Desktop  */}
                      <span className={`inline-flex justify-center ${isTicketVacancyFullOrNotAvailable(item) ? "" : "cursor-pointer"} grow xs:hidden`}>
                        <Image
                          src={isTicketVacancyFullOrNotAvailable(item) ? XImg : OImg}
                          alt={isTicketVacancyFullOrNotAvailable(item) ? "x" : "o"}
                          onClick={() => onClickOnlineTicketVacancy(item)}
                        />
                      </span>
                      {/* Mobile */}
                      <span className="xs:inline-flex justify-center cursor-pointer grow hidden">
                        <Image
                          src={isTicketVacancyFullOrNotAvailable(item) ? XSmallImg : OSmallImg}
                          alt={isTicketVacancyFullOrNotAvailable(item) ? "x" : "o"}
                          onClick={() => onClickOnlineTicketVacancy(item)}
                        />
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </DialogContent>
      </div>
    </Dialog>
  );
}
