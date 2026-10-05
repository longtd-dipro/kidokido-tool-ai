import { Dialog, DialogActions, DialogContent } from "@mui/material";
import Image from "next/legacy/image";
import moment from "moment";
import { useState } from "react";
import { cloneDeep } from "lodash";

import MinusIcon from "statics/images/minus-icon.svg";
import PlusIcon from "statics/images/plus-icon.svg";
import Button from "components/common/Buttons/Button";
import { BookingVacancy, TicketVacancies } from "models/Booking";
import { JP_SHORT_DATE } from "constants/common";
interface Props {
  bookingVacancy: BookingVacancy;
  onSubmit?: any;
  onDismiss: any;
}

export default function ManageVacanciesDialog({ bookingVacancy, onDismiss, onSubmit }: Props) {
  const [ticketVacancies, setTicketVacancies] = useState<TicketVacancies[]>(cloneDeep(bookingVacancy.tickets));

  const incrementBookingVacancies = (index: number) => {
    const currentTicketVacancies = cloneDeep(ticketVacancies);
    currentTicketVacancies[index].maxBookingPeople += 1;
    setTicketVacancies(currentTicketVacancies);
  };

  const decrementBookingVacancies = (index) => {
    if (ticketVacancies[index].maxBookingPeople <= 0) return;
    const currentTicketVacancies = cloneDeep(ticketVacancies);
    currentTicketVacancies[index].maxBookingPeople -= 1;
    setTicketVacancies(currentTicketVacancies);
  };

  const handleSubmit = () => {
    const changedTicketVacancies = [];
    for (let i = 0; i < ticketVacancies.length; i++) {
      if (ticketVacancies[i].maxBookingPeople !== bookingVacancy.tickets[i].maxBookingPeople) {
        changedTicketVacancies.push(ticketVacancies[i]);
      }
    }

    if (changedTicketVacancies.length) {
      onSubmit(changedTicketVacancies);
    } else {
      onDismiss();
    }
  };

  return (
    <Dialog disablePortal open={true} onClose={onDismiss} aria-labelledby="responsive-dialog-title" className="max-w-[540px] xsup:w-full mx-auto xs:mx-5">
      <div className="flex flex-col items-center gap-[35px] justify-center pt-[20px] px-[20px] pb-[40px]">
        <div className="flex max-w-[500px] w-full flex-row items-start justify-center">
          <h3 className="text-[20px] leading-[28px] font-bold">{moment(bookingVacancy.date).format(JP_SHORT_DATE)}</h3>
        </div>
        <div className="flex max-w-[500px] w-full flex-row items-start justify-center">
          <h3 className="text-[20px] leading-[28px] font-bold text-black">現在の設定</h3>
        </div>

        <DialogContent className="p-0">
          <div className="flex flex-col gap-[24px] p-0 text-color">
            {ticketVacancies.map((ticketVacancy, index) => (
              <div className="flex gap-[55px] justify-between items-center" key={index}>
                <h3 className="w-[140px] xs:w-[120px] break-all text-base leading-[20px] font-medium">{ticketVacancy.name}</h3>
                <div className="flex flex-row items-center gap-[20px] text-[18px] leading-[24px] font-bold">
                  {bookingVacancy.tickets[index].maxBookingPeople !== undefined && (
                    <>
                      <p className="flex justify-items-start">{bookingVacancy.tickets[index].maxBookingPeople}/</p>
                      <div className="flex h-[42px] items-center gap-[16px] bg-[#E9FAFF] rounded-[5px] px-[9px]">
                        <div className="cursor-pointer h-[25px]" onClick={() => decrementBookingVacancies(index)}>
                          <Image src={MinusIcon} alt="Minus" />
                        </div>
                        <p className="w-[40px] text-center">{ticketVacancy.maxBookingPeople}</p>
                        <div className="cursor-pointer h-[25px]" onClick={() => incrementBookingVacancies(index)}>
                          <Image src={PlusIcon} alt="Plus" />
                        </div>
                      </div>
                    </>
                  )}
                  {bookingVacancy.tickets[index].maxBookingPeople === undefined && <p>-/-</p>}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
        <DialogActions className="flex p-0 gap-[16px]">
          <Button variant="outlined" onClick={onDismiss} className="w-[135px] h-[44px]">
            キャンセル
          </Button>
          <Button variant="contained" onClick={handleSubmit} className="w-[135px] h-[44px]">
            保存
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
}
