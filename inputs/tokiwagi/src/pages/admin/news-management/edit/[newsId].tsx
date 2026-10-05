import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { News } from "@prisma/client";

import AdminLayout from "components/common/AdminLayout";
import CreateOrUpdateNews from "components/CreateOrUpdateNews";
import { MESSAGES } from "constants/messages";
import { ROUTE } from "constants/route";
import { NotificationType, showNotification } from "stores/reducers/notification";
import { fetchNewsById } from "services/api-client/admin/news.service";
import Error from "components/common/Error";
import { getUrlQueryValue } from "utils/url";

export default function EditNewsPage() {
  const router = useRouter();
  const [errMsg, setErrMsg] = useState<string>();
  const [news, setNews] = useState<News>();

  const dispatch = useDispatch();

  const newsId = +router.query.newsId;
  const page = getUrlQueryValue("page");

  useEffect(() => {
    newsId && fetchData(newsId);
  }, [newsId]);

  const fetchData = async (newsId: number) => {
    try {
      setErrMsg("");
      const news = await fetchNewsById(newsId);
      setNews(news);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const handleSaveSuccess = () => {
    router.push(ROUTE.NEWS_MANAGEMENT);
    dispatch(showNotification({ type: NotificationType.SUCCESS, message: MESSAGES.SETTING_EMAIL_SUCCESSFUL }));
  };

  const handleCancel = () => {
    router.push({ pathname: ROUTE.NEWS_MANAGEMENT, query: { page } });
  };

  return (
    <AdminLayout heading="お知らせの編集" breadcrumb={[{ title: "" }]}>
      <section className="ad-section-container ad-table-wrapper mb-12">
        {/*Error*/}
        <Error message={errMsg} />

        {news && <CreateOrUpdateNews news={news} onSuccess={handleSaveSuccess} onCancel={handleCancel} />}
      </section>
    </AdminLayout>
  );
}
