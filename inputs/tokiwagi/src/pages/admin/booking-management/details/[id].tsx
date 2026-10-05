import moment from "moment";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import bwipjs from "bwip-js";
import { groupBy } from "lodash";
import { BookingStatus, PaymentType } from "@prisma/client";
import { useDispatch, useSelector } from "react-redux";
import { useSession } from "next-auth/react";

import AdminLayout from "components/common/AdminLayout";
import Error from "components/common/Error";
import { JP_SHORT_DATE, ROLE, SHORT_TIME } from "constants/common";
import { ROUTE } from "constants/route";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { Booking } from "models/Entity";
import { fetchBookingById } from "services/api-client/admin/booking.service";
import styles from "styles/booking-management.module.scss";
import { formatThousands } from "utils/common";
import Spinner from "components/common/Spinner";
import AdminButton from "components/common/Buttons/AdminButton";
import { getBookingModificationStatus, isOnlineMonthlyBooking } from "utils/booking";
import { getAgeLabel } from "utils/ticket";
import { confirmCredentials, confirmPassword } from "utils/ui";
import { getIncludedProvinceAddress, getUserGenderLabel } from "utils/user";
import { getUrlQueryValue } from "utils/url";
import { selectStaffManagement } from "stores/reducers/staff-management";
import { fetchBookings } from "services/api-client/booking.service";
import { getUseInDayBookingAmount } from "utils/discount";

function BookingManagementDetail() {
  const [booking, setBooking] = useState<Booking>();
  const [sameBarcodeBookings, setSameBarcodeBookings] = useState<Booking[]>();
  const [errMsg, setErrMsg] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [shouldConfirmCredentials, setShouldConfirmCredentials] = useState<boolean>(false);

  const dispatch = useDispatch();
  const { data: session } = useSession();
  const { staffOrAdmin: loggedStaffOrAdmin } = useSelector(selectStaffManagement());

  const router = useRouter();

  const filters = getUrlQueryValue("filters");
  const page = getUrlQueryValue("page");
  const role = getUrlQueryValue("role") || loggedStaffOrAdmin?.role;
  const staffOrAdminId = getUrlQueryValue("staffOrAdminId");

  const isStaffRole = role === ROLE.STAFF;

  useEffect(() => {
    if (loggedStaffOrAdmin && staffOrAdminId !== loggedStaffOrAdmin.id.toString()) {
      setShouldConfirmCredentials(true);
      showConfirmPopup();
    }

    fetchData();
  }, []);

  useEffect(() => {
    try {
      bwipjs.toCanvas("barcode", {
        bcid: "code128",
        text: booking?.barCode,
        scale: 3,
        height: 10,
        includetext: true,
        textxalign: "center",
      });
    } catch (err) {
      setErrMsg(err.message);
    }
  }, [booking]);

  const showConfirmPopup = async () => {
    try {
      const isOriginalAdminId = session?.user?.id?.toString() === staffOrAdminId;
      isOriginalAdminId ? await confirmPassword(dispatch) : await confirmCredentials(dispatch, staffOrAdminId);
      setShouldConfirmCredentials(false);
    } catch (e) {
      router.push(ROUTE.BOOKING_MANAGEMENT);
    }
  };
  const fetchData = async () => {
    try {
      setErrMsg("");
      setLoading(true);
      const id = Number(router.query.id);
      const booking = await fetchBookingById(id);
      const sameBarcodeBookings = await fetchBookings({ barCode: booking.barCode, includeBookingSchedule: true });
      setSameBarcodeBookings(sameBarcodeBookings);
      setBooking(booking);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRedirect = () => {
    router.push({
      pathname: ROUTE.BOOKING_MANAGEMENT_LIST,
      query: {
        filters,
        page,
        ...(staffOrAdminId && { staffOrAdminId }),
      },
    });
  };

  const handleRedirectToUpdate = async () => {
    try {
      await confirmPassword(dispatch);
    } catch (error) {
      return;
    }
    const isCheckingIn = booking.status === BookingStatus.CheckedIn;
    router.push({
      pathname: `${ROUTE.BOOKING_MANAGEMENT_UPDATE}/${booking.id}`,
      query: { checking_in: isCheckingIn, filters, page, staffOrAdminId },
    });
  };

  const childAges = groupBy(booking?.BookingChildAgeInfo, "childAgeInMonth");
  const childAgeKeys = Object.keys(childAges);

  let canEdit = null;
  if (booking) {
    canEdit = getBookingModificationStatus(booking).canEdit;
  }

  const shouldShowBarCode = booking && !isOnlineMonthlyBooking(booking);

  return (
    <AdminLayout>
      <div className="pt-16 pb-24 ad-section-container">
        {/*Error*/}
        <Error message={errMsg} />

        {/*Data */}
        {!loading && booking && !shouldConfirmCredentials && (
          <div className={styles.detail}>
            <div className="max-w-[575px] w-full mx-auto flex flex-col justify-center bookings-center md:max-w-[unset] md:px-[31px]">
              <h1 className="text-[24px] leading-[32px]font-bold mb-[21px] text-center">予約詳細</h1>
              {!isStaffRole && (
                <div className="w-full mt-4">
                  <h2 className={`${styles.heading} pb-2 text-xl`}>お客様情報</h2>
                  <div className="mx-4 my-8 flex">
                    <div className="w-[200px] font-medium text-[16px] leading-[20px] flex flex-col gap-[16px]">
                      <span>お名前</span>
                      <span>お名前（カナ）</span>
                      <span>電話番号</span>
                      <span>メール</span>
                      <span>性別</span>
                      <span>生年月日</span>
                      <span>住所</span>
                    </div>
                    <div className="font-bold text-[14px] leading-[20px] flex flex-col gap-[16px]">
                      <span>
                        {booking.User.lastName} {booking.User.firstName}
                      </span>
                      <span>
                        {booking.User.lastNameFurigana} {booking.User.firstNameFurigana}
                      </span>
                      <span>{booking.User.phone}</span>
                      <span>{booking.User.email}</span>
                      <span>{getUserGenderLabel(booking.User.gender)}</span>
                      <span className="min-h-[20px]">{booking.User.birthday ? moment(booking.User.birthday).format(JP_SHORT_DATE) : ""}</span>
                      <span>{getIncludedProvinceAddress(booking.User)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="w-full mt-4 mb-[72px] md:mb-[50px]">
                <h2 className={`${styles.heading} pb-2 text-xl`}>パス情報</h2>
                <div className="mx-4 mt-8 flex">
                  <div className="font-medium text-[16px] leading-[20px] flex flex-col gap-[16px]">
                    <div className="flex flex-row">
                      <span className="w-[200px]">店舗</span>
                      <span className="font-bold">{booking?.Tenant.name}</span>
                    </div>
                    <div className="flex flex-row">
                      <span className="w-[200px]">予約ID</span>
                      <span className="font-bold">{booking?.id}</span>
                    </div>
                    <div className="flex flex-row">
                      <span className="w-[200px]">商品</span>
                      <span className="font-bold">{booking?.Ticket.name}</span>
                    </div>
                    <div className="flex flex-row">
                      <span className="w-[200px]">購入日時</span>
                      <span className="font-bold">{moment(booking.createdAt).format(JP_SHORT_DATE)}</span>
                    </div>
                    <div className="flex flex-row">
                      <span className="w-[200px]">利用時間</span>
                      <span className="font-bold">{moment(booking.date).format(JP_SHORT_DATE)}</span>
                    </div>
                    <div className="flex flex-row">
                      <span className="w-[200px]">おとなの人数</span>
                      <span className="font-bold">{booking.adultQuantity}人</span>
                    </div>
                    <div className="flex flex-row">
                      <span className="w-[200px]">子どもの人数・年齢</span>
                      <div>
                        {childAgeKeys.map((key) => {
                          const childAge = childAges[key];
                          return (
                            <div key={key} className="font-bold mb-[16px]">
                              {childAge.length}人 x {getAgeLabel(+key)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {/*checkedInAt*/}
                    {!!booking.checkedInAt && (
                      <div className="flex flex-row">
                        <span className="w-[200px]">入場時間</span>
                        <span className="font-bold">{moment(booking.firstCheckedInAt || booking.checkedInAt).format(SHORT_TIME)}</span>
                      </div>
                    )}

                    <div className="flex flex-row">
                      <span className="w-[200px]">利用料金</span>
                      <span className="font-bold">{booking && sameBarcodeBookings
                        && formatThousands(getUseInDayBookingAmount(booking, sameBarcodeBookings))}円</span>
                    </div>
                    <div className="flex flex-row">
                      <span className="w-[200px]">支払方法</span>
                      <span className="font-bold">{booking.Ticket.paymentType === PaymentType.Online ? "カード決済" : "店舗決済"}</span>
                    </div>
                    {shouldShowBarCode && (
                      <>
                        <div className="flex flex-row">
                          <span className="w-[200px]">バーコード</span>
                          <span className="font-bold">
                            <canvas id="barcode" className="xs:mx-auto"></canvas>
                          </span>
                        </div>
                        <div className="flex flex-row">
                          <span className="w-[200px]">バーコードID</span>
                          <span className="font-bold">{booking.barCode}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-[79px]">
                <AdminButton variant="outlined" onClick={handleRedirect} className="w-[230px] h-[56px] md:w-[144px] md:h-[36px]">
                  戻る
                </AdminButton>
                {canEdit && (
                  <AdminButton variant="contained" onClick={handleRedirectToUpdate} className="w-[230px] h-[56px] md:w-[144px] md:h-[36px]">
                    編集する
                  </AdminButton>
                )}
              </div>
            </div>
          </div>
        )}

        {shouldConfirmCredentials && <div className="min-h-screen"></div>}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center">
            <Spinner />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default withAuthentication(BookingManagementDetail, [ROLE.ADMIN, ROLE.SUPER_ADMIN]);
