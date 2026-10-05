import { FormControl, MenuItem, Select, TextField } from "@mui/material";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import moment from "moment";
import { useEffect, useState } from "react";

import Label from "components/common/Admin/Label";
import { SHORT_DATE } from "constants/common";
import { Tenant, Ticket } from "models/Entity";
import { fetchTotalBookingsWithTicket } from "services/api-client/admin/chart.service";
import { fetchTenants } from "services/api-client/admin/tenant.service";
import { fetchTickets } from "services/api-client/admin/ticket.service";
import { CalendarIcon } from "statics/images/components/CalendarIcon";
import { getTicketById } from "utils/ticket";
import { getTenantByCode } from "utils/tenant";

const generateOptions = (data) => ({
  chart: {
    type: "column",
  },
  title: {
    text: "該当者数",
  },
  xAxis: {
    type: "category",
    title: {
      align: "high",
      text: "パス",
      style: {
        fontWeight: "bold",
      },
    },
  },
  yAxis: {
    min: 0,
    title: {
      text: "該当者数",
      align: "high",
      offset: 0,
      rotation: 0,
      y: -15,
      style: {
        fontWeight: "bold",
      },
    },
  },

  plotOptions: {
    column: {
      states: {
        hover: {
          color: "#EED200",
        },
      },
    },
  },
  legend: { enabled: false },

  series: [
    {
      name: "人",
      data,
      color: "#006DC6",
    },
  ],
});

export default function TotalBookingsWithTicketColumnChart() {
  const [data, setData] = useState<any[]>(null);
  const [options, setOptions] = useState({});
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantCode, setTenantCode] = useState("");
  const [totalDates, setTotalDates] = useState<number>(null);

  useEffect(() => {
    data && setOptions(generateOptions(data));
  }, [data]);

  useEffect(() => {
    if (dateFrom && dateTo && tenantCode) {
      fetchData(dateFrom, dateTo, tenantCode);
      const diffOfDays = moment.duration(moment(dateTo).diff(dateFrom)).asDays();
      const totalDates = diffOfDays >= 0 ? diffOfDays + 1 : null;
      setTotalDates(totalDates);
    }
  }, [dateFrom, dateTo, tenantCode, tickets]);

  useEffect(() => {
    fetchTenantList();
    fetchTicketList();
  }, []);

  const fetchData = async (dateFrom: string, dateTo: string, tenantCode: string) => {
    const statistics: Statistic[] = await fetchTotalBookingsWithTicket({ dateFrom, dateTo, tenantCode });
    const columnChartStatistic = statistics.map(({ ticket_id, total_bookings }) => [getTicketById(ticket_id, tickets).name, total_bookings]);
    setData(columnChartStatistic);
  };

  const fetchTenantList = async () => {
    const response = await fetchTenants();
    setTenants(response);
  };

  const fetchTicketList = async () => {
    const response = await fetchTickets();
    setTickets(response);
  };

  const handleChangeTenantSelect = (e) => {
    setTenantCode(e.target.value);
  };

  return (
    <>
      <div className="flex gap-4 justify-end mb-4">
        {/* Select tenant */}
        <div>
          <Label className="!font-medium !text-sm">店舗名</Label>
          <br />
          <FormControl fullWidth>
            <Select
              labelId="tenant"
              id="tenant-select"
              value={tenantCode}
              onChange={handleChangeTenantSelect}
              className="ad-datepicker-field !mt-2 w-[130px] !rounded-[30px]"
              renderValue={(value) => getTenantByCode(value, tenants)?.code || value}
            >
              {tenants.map((tenant) => (
                <MenuItem key={tenant.code} value={tenant.code}>
                  {tenant.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {/* Date From */}
        <div>
          <Label className="!font-medium !text-sm">開始期間</Label>
          <br />
          <DesktopDatePicker
            mask="____/__/__"
            components={{
              OpenPickerIcon: CalendarIcon,
            }}
            value={dateFrom}
            onChange={(newValue) => {
              setDateFrom(moment(newValue).format(SHORT_DATE));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                className="ad-datepicker-field !mt-2 !max-w-[200px] !w-full"
                inputProps={{
                  ...params.inputProps,
                  readOnly: true,
                }}
              />
            )}
          />
        </div>

        {/* Date To */}
        <div>
          <Label className="!font-medium !text-sm">終了期間</Label>
          <br />
          <DesktopDatePicker
            mask="____/__/__"
            components={{
              OpenPickerIcon: CalendarIcon,
            }}
            value={dateTo}
            onChange={(newValue) => {
              setDateTo(moment(newValue).format(SHORT_DATE));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                className="ad-datepicker-field !mt-2 !max-w-[200px] !w-full"
                inputProps={{
                  ...params.inputProps,
                  readOnly: true,
                }}
              />
            )}
          />
        </div>

        {/* Total Dates Count */}
        <div>
          <Label className="!font-medium !text-sm">日数</Label>
          <p className="mt-2 px-2 ad-bg rounded-xl h-[34px] flex items-center justify-center min-w-[40px]">{totalDates}</p>
        </div>
      </div>

      {data ? (
        data.length ? (
          <HighchartsReact highcharts={Highcharts} options={options} />
        ) : (
          <p className="text-center mt-8">データーがありません</p>
        )
      ) : (
        <p className="text-center mt-8">日付と店舗を選択してください</p>
      )}
    </>
  );
}

type Statistic = {
  ticket_id: number;
  total_bookings: number;
};
