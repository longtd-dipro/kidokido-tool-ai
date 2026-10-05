import React, { useEffect, useState } from "react";
import {
  Box,
  SelectChangeEvent,
  Tab,
  Tabs,
} from "@mui/material";
import { BookingStatus } from "@prisma/client";
import { useDispatch } from "react-redux";

import AdminLayout from "components/common/AdminLayout";
import Error from "components/common/Error";
import {
  ROLE,
} from "constants/common";
import { withAuthentication } from "libs/hoc/withAuthentication";
import {
  fetchBookingQueueCalling,
  fetchBookingQueueSystemCancelled,
  fetchBookingQueueWaiting,
  updateWaitingOrderForBookingQueue,
  updateStatusBookingQueue,
} from "services/api-client/admin/booking-queue.service";
import { Booking } from "models/Entity";
import {
  NotificationType,
  showNotification,
} from "stores/reducers/notification";
import { MESSAGES } from "constants/messages";
import Calling from "components/BookingQueue/Calling";
import Waiting from "components/BookingQueue/Waiting";
import SystemCancelled from "components/BookingQueue/SystemCancelled";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

function BookingQueue() {
  const [tabIndex, setTabIndex] = useState(1);
  const [errMsg, setErrMsg] = useState<string>();

  const [callingBookingsData, setCallingBookingsData] = useState<any>();
  const [waitingBookingsData, setWaitingBookingsData] = useState<any>();
  const [systemCancelledBookings, setSystemCancelledBookings] = useState<Booking[]>([]);

  const dispatch = useDispatch();

  useEffect(() => {
    refreshWaitingQueue();
  }, []);

  const refreshWaitingQueue = async () => {
    await fetchDataQueueWaiting();
  };

  const refreshCallingQueue = async () => {
    await fetchDataQueueCallings();
  };

  const refreshAbsentQueue = async () => {
    await fetchDataQueueAbsents();
  };

  const fetchDataQueueWaiting = async () => {
    try {
      setErrMsg("");
      const waitingBookingsData = await fetchBookingQueueWaiting();
      setWaitingBookingsData(waitingBookingsData);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const fetchDataQueueCallings = async () => {
    try {
      setErrMsg("");
      const callingData = await fetchBookingQueueCalling();
      setCallingBookingsData(callingData);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const fetchDataQueueAbsents = async () => {
    try {
      setErrMsg("");
      const dataAbsent = await fetchBookingQueueSystemCancelled();
      setSystemCancelledBookings(dataAbsent);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const processUpdateWaitingOrderForBookingQueue = async (
    updatedPositionData
  ) => {
    try {
      setErrMsg("");

      await updateWaitingOrderForBookingQueue(updatedPositionData);
      await fetchDataQueueWaiting();
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const processUpdateStatusBookingQueue = async (
    item: Booking,
    needToSendNotification: boolean
  ) => {
    try {
      setErrMsg("");

      await updateStatusBookingQueue(item, needToSendNotification);
      dispatch(
        showNotification({
          type: NotificationType.SUCCESS,
          message: MESSAGES.CHANGE_STATUS_SUCCESSFUL,
        })
      );
      await fetchDataQueueWaiting();
      await fetchDataQueueAbsents();
      await fetchDataQueueCallings();
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const handleChangeStatus = async (event: SelectChangeEvent, item: any) => {
    item.status = BookingStatus[event.target.value];

    await processUpdateStatusBookingQueue(item, false);
  };

  const handleTabChange = (event: React.SyntheticEvent, newTabIndex: number) => {
    setTabIndex(newTabIndex);
  };

  return (
    <AdminLayout>
      <section className="relative body-font mdup:pl-5">
        {/*Error*/}
        <Error message={errMsg} />
        <Box sx={{ width: "100%" }} className="flex flex-col gap-[24px]">
          {/* Tab Label */}
          <Box sx={{ borderColor: "divider" }}>
            <Tabs
              value={tabIndex}
              onChange={handleTabChange}
              variant="fullWidth"
              aria-label="tabs table queue"
              TabIndicatorProps={{
                style: {
                  background:
                    "linear-gradient(270deg, #68B5FF 0%, #1A7DCE 100%) !important",
                  height: 48,
                  borderRadius: 20,
                },
              }}
              sx={{
                "& button": { color: "#006DC6", fontWeight: 500 },
                "& button.Mui-selected": {
                  color: "#FFFFFF",
                  fontWeight: 700,
                  backgroundColor: "transparent !important",
                },
              }}
              className="rounded-[20px] bg-white text-white border-blue-500 
                h-[56px] border-solid border-[2px] px-[2px] justify-center items-center"
            >
              <Tab
                label="呼び出し中リスト"
                id="tab-0"
                aria-controls="tabpanel-0"
                onClick={() => fetchDataQueueCallings()}
                className="z-50"
              />
              <Tab
                label="順番待ち中リスト"
                id="tab-1"
                aria-controls="tabpanel-0"
                onClick={() => fetchDataQueueWaiting()}
                className="z-50"
              />
              <Tab
                label="キャンセルリスト"
                id="tab-2"
                aria-controls="tabpanel-0"
                onClick={() => fetchDataQueueAbsents()}
                className="z-50"
              />
            </Tabs>
          </Box>

          {/* Tab Table Calling Queue */}
          <TabPanel value={tabIndex} index={0}>
            <Calling refreshCallingQueue={refreshCallingQueue} handleChangeStatus={handleChangeStatus} callingBookingsData={callingBookingsData} />
          </TabPanel>

          {/* Tab Table Waiting Queue */}
          <TabPanel value={tabIndex} index={1}>
            {waitingBookingsData && <Waiting processUpdateStatusBookingQueue={processUpdateStatusBookingQueue}
              processUpdateWaitingOrderForBookingQueue={processUpdateWaitingOrderForBookingQueue}
              waitingBookingsData={waitingBookingsData}
              refreshWaitingQueue={refreshWaitingQueue} handleChangeStatus={handleChangeStatus} />
            }
          </TabPanel>

          {/* Tab Table Absent Queue */}
          <TabPanel value={tabIndex} index={2}>
            <SystemCancelled refreshAbsentQueue={refreshAbsentQueue} handleChangeStatus={handleChangeStatus} bookings={systemCancelledBookings} />
          </TabPanel>
        </Box>
      </section>
    </AdminLayout>
  );
}

export default withAuthentication(BookingQueue, [ROLE.ADMIN]);
