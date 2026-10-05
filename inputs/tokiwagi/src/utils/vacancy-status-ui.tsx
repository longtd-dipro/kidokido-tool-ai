import Image from "next/legacy/image";

import { OnlineTicketVacancy, TenantVacancy } from "models/Vacancy";
import { VACANCY_STATUS_ICON } from "models/enums";
import OSmallImg from "statics/images/user/circle-blue-small.svg";
import OImg from "statics/images/user/circle-blue.svg";
import XSmallImg from "statics/images/user/x-red-small.svg";
import XImg from "statics/images/user/x-red.svg";
import { getOnlineTicketVacancyStatusIcon } from "utils/vacancy-status";

export const renderTicketOnlineVacancyStatusIcon = (vacancy: OnlineTicketVacancy | TenantVacancy, isSmallIconMode = false) => {
  const vacancyStatusIcon = getOnlineTicketVacancyStatusIcon(vacancy);

  const options = {
    [VACANCY_STATUS_ICON.O]: <Image src={isSmallIconMode ? OSmallImg : OImg} alt="o" />,
    [VACANCY_STATUS_ICON.X]: <Image src={isSmallIconMode ? XSmallImg : XImg} alt="x" />,
    [VACANCY_STATUS_ICON.Hyphen]: <span className="text-[#313131] h-[20px]"> ー </span>,
  };

  return options[vacancyStatusIcon];
};
