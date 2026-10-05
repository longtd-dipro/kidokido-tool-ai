import { News } from "@prisma/client";
import moment from "moment";
import { useState } from "react";

import { SHORT_DATE_DOT } from "constants/common";
import styles from "styles/top-page.module.scss";
import NewsItemDialog from "components/TopPage/News/NewsItemDialog";

export interface Props {
  news: News;
}

export default function NewsItem({ news }: Props) {
  const { date, title } = news;
  const [isShowDialog, setIsShowDialog] = useState<boolean>(false);

  const showNewsItemDialog = () => {
    setIsShowDialog(true);
  };

  const hideNewsItemDialog = () => {
    setIsShowDialog(false);
  };

  return (
    <>
      <div className="flex flex-row xs:items-start items-center xs:flex-col gap-x-12 xs:gap-y-2">
        <h1 className={styles.news_date}>{moment(date).format(SHORT_DATE_DOT)}</h1>
        <span className={styles.news_title} onClick={showNewsItemDialog}>
          {title}
        </span>
      </div>
      <div className={`${styles.news_breadcrumb} w-full`}></div>

      {isShowDialog && <NewsItemDialog onDismiss={hideNewsItemDialog} news={news} />}
    </>
  );
}
