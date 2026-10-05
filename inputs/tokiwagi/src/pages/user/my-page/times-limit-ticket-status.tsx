import React, { useState, useEffect, useRef } from "react";
import { Container, Pagination } from "@mui/material";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";

import { Booking } from "models/Entity";
import TimesLimitTicketStatusCard from "components/User/TimesLimitTicketStatusCard";
import Error from "components/common/Error";
import UserLayout from "components/common/UserLayout";
import { useCachedPagination } from "libs/hooks/useCachedPagination";
import { getMessageFromError } from "utils/common";
import LoadingSpinner from "components/common/Admin/LoadingSpinner";
import WarningDialog from "components/common/WarningDialog";
import { ROUTE } from "constants/route";
import { fetchTimesLimitTickets, fetchTotalTimesLimitTickets } from "services/api-client/user.service";

const DEFAULT_LIMIT = 4;

export default function StatusMonthlyTicket() {
  const [errMsg, setErrMsg] = useState<string>("");
  const [isShowNotMatchAccountDialog, setIsShowNotMatchAccountDialog] = useState<boolean>(false);

  const router = useRouter();
  const fromUrlUserId = +router.query.userId;

  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const pagination = useCachedPagination({
    onPageChange: (page) => {
      fetchData(page);
    },
  });

  const isInitialFetchRef = useRef(true);

  const [loading, setLoading] = useState(false);
  const [timesLimitBookings, setTimesLimitBookings] = useState<Booking[]>();
  const [totalBookings, setTotalBookings] = useState<number>(1);

  useEffect(() => {
    fetchData();
    fetchTotal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentUserId && fromUrlUserId && currentUserId !== fromUrlUserId) {
      setIsShowNotMatchAccountDialog(true);
    }
  }, [currentUserId, fromUrlUserId]);

  const forceUserLogout = () => {
    signOut({ callbackUrl: ROUTE.SIGN_IN });
  };

  const fetchTotal = async () => {
    try {
      const totalData = await fetchTotalTimesLimitTickets({
        includeCancelledStatus: true 
      });
      setTotalBookings(totalData.data);
    } catch (error) {
      const message = getMessageFromError(error);
      setErrMsg(message);
    }
  };

  const fetchData = async (page = 1) => {
    try {
      setErrMsg("");
      setLoading(true);
      const response = await fetchTimesLimitTickets({
        page: page,
        limit: DEFAULT_LIMIT,
        includeCancelledStatus: true,
        includeDeadlineDate: true,
      });

      setTimesLimitBookings(response);

      if (!isInitialFetchRef.current) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      isInitialFetchRef.current = false;
    } catch (error) {
      const message = getMessageFromError(error);
      setErrMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserLayout
      title="回数券の確認"
      breadcrumbItems={[
        { label: "トップ", href: ROUTE.INDEX },
        { label: "回数券の確認", href: ROUTE.USER_TIMES_LIMIT_TICKET },
      ]}
    >
      <Error message={errMsg} />
      <Container className="">
        <>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div id="bookingList" className="flex flex-col items-center gap-[32px] pb-[32px]">
              {timesLimitBookings?.map((item: Booking) => (
                <TimesLimitTicketStatusCard
                  timesLimitBooking={item}
                  key={item.id}
                  disabled={loading}
                  totalInUseDays={item.Ticket.TicketDetail.totalDaysInUseFromStart}
                />
              ))}
              {timesLimitBookings && timesLimitBookings.length === 0 && (
                <div className="text-center">
                  <p className="text-[20px] font-medium">ご購入の回数券はございません</p>
                </div>
              )}
            </div>
          )}
        </>
        <div className="flex justify-center">
          {timesLimitBookings?.length > 0 && (
            <Pagination
              className="user-pagination"
              count={totalBookings ? Math.ceil(totalBookings / DEFAULT_LIMIT) : 0}
              variant="outlined"
              shape="rounded"
              page={pagination.page}
              onChange={(e, nextPage) => pagination.setPage(nextPage)}
            />
          )}
        </div>
      </Container>
      {isShowNotMatchAccountDialog && (
        <WarningDialog
          message="予約したアカウントとは異なるアカウントでログインしています。<br/>予約した正しいアカウントで再度ログインをお願いいたします。"
          text="OK"
          hideDismissButton={true}
          hideCloseButton={true}
          onDismiss={() => {}}
          onAccept={forceUserLogout}
        />
      )}
    </UserLayout>
  );
}
