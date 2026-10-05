import { News } from "@prisma/client";
import { useEffect, useState } from "react";

import NewsItem from "components/TopPage/News/NewsItem";
import styles from "styles/top-page.module.scss";
import { fetchNews } from "services/news.service";
import Spinner from "components/common/Spinner";
import Error from "components/common/Error";

const PAGE = 1;
const LIMIT = 5;

export default function NewsSection() {
  const [errMsg, setErrMsg] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [news, setNews] = useState<News[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setErrMsg("");
      setLoading(true);

      const news = await fetchNews({ page: PAGE, limit: LIMIT, sort_by: "date.desc" });
      setNews(news);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full mx-auto text-center">
      <h1 className={`${styles.heading_information} mb-4 md:mb-2 xs:!text-[14px]`}>お知らせ</h1>
      {!loading && (
        <div className={`${styles.news} mx-auto px-5 mdonly:px-10`}>
          {news.length ? (
            news.map((newsItem) => <NewsItem key={newsItem.id} news={newsItem} />)
          ) : (
            <p className="mx-auto font-light text-placeholder xs:text-sm">ー</p>
          )}
        </div>
      )}

      {loading && (
        <div className="mt-8">
          <Spinner />
        </div>
      )}

      {errMsg && (
        <div className="mt-8">
          <Error message={errMsg} />
        </div>
      )}
    </section>
  );
}
