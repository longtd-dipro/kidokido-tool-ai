import { FormControl, MenuItem, Select, TextField } from "@mui/material";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import moment from "moment";
import { useEffect, useState } from "react";

import { SHORT_DATE } from "constants/common";
import { CalendarIcon } from "statics/images/components/CalendarIcon";
import { fetchTotalBookingsWithTimes } from "services/api-client/admin/chart.service";
import { fetchTenants } from "services/api-client/admin/tenant.service";
import { Tenant } from "models/Entity";
import Label from "components/common/Admin/Label";
import { getTenantByCode } from "utils/tenant";
const generateOptions = (data) => ({
  chart: {
    type: "column",
  },

  title: {
    text: "来店回数",
  },

  xAxis: {
    type: "category",
    title: {
      align: "high",
      text: "来店回数",
      style: {
        fontWeight: "bold",
      },
    },
  },

  yAxis: {
    type: "logarithmic",
    visible: true,
    title: {
      align: "high",
      offset: -20,
      rotation: 0,
      y: -15,
      text: "該当人数",
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
      name: "該当人数",
      data,
      color: "#006DC6",
    },
  ],
});

type TimesInfo = {
  label: string;
  isRange: boolean;
  value?: number;
  min?: number;
  max?: number;
};

type Statistic = {
  times: number;
  total_bookings: number;
};

const TIMES: TimesInfo[] = [
  { label: "1", value: 1, isRange: false },
  { label: "2", value: 2, isRange: false },
  { label: "3", value: 3, isRange: false },
  { label: "4", value: 4, isRange: false },
  { label: "5", value: 5, isRange: false },
  { label: "6", value: 6, isRange: false },
  { label: "7", value: 7, isRange: false },
  { label: "8", value: 8, isRange: false },
  { label: "9", value: 9, isRange: false },
  { label: "10-50", min: 10, max: 50, isRange: true },
  { label: "51-100", min: 51, max: 100, isRange: true },
  { label: "その他", min: 101, isRange: true },
];

export default function TotalBookingsWithTimesColumnChart() {
  const [data, setData] = useState<any[]>(null);
  const [options, setOptions] = useState({});
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
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
  }, [dateFrom, dateTo, tenantCode]);

  useEffect(() => {
    fetchTenantList();
  }, []);

  const fetchData = async (dateFrom: string, dateTo: string, tenantCode: string) => {
    const statistics = await fetchTotalBookingsWithTimes({ dateFrom, dateTo, tenantCode });
    if (statistics.length === 0) {
      return setData([]);
    }

    const columnChartStatistic = TIMES.map((item) => [item.label, getTotalBookings(item, statistics)]);
    setData(columnChartStatistic);
  };

  const fetchTenantList = async () => {
    const response = await fetchTenants();
    setTenants(response);
  };

  const handleChangeTenantSelect = (e) => {
    setTenantCode(e.target.value);
  };

  return (
    <>
      <div className="flex md:grid md:grid-cols-1 gap-4 mb-4 justify-between h-full ">
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
              className="ad-datepicker-field !mt-2 !rounded-[30px] !max-w-[112px] !w-full"
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

        <div className="flex md:grid md:grid-cols-1 gap-x-3">
          {/* From Date */}
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
                    className: "!pr-0",
                    readOnly: true,
                  }}
                />
              )}
            />
          </div>

          {/* End Date */}
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
                    className: "!pr-0",
                    readOnly: true,
                  }}
                />
              )}
            />
          </div>
        </div>
      </div>

      {/* Total Dates Count */}
      <div className="flex justify-end mb-2">
        <p>日数: {totalDates}</p>
      </div>

      <div>
        {data ? (
          data.length ? (
            <HighchartsReact highcharts={Highcharts} options={options} />
          ) : (
            <p className="text-center mt-8">データーがありません</p>
          )
        ) : (
          <p className="text-center mt-8">日付と店舗を選択してください</p>
        )}
      </div>
    </>
  );
}

const getTotalBookings = (timesInfo: TimesInfo, statistics: Statistic[]) => {
  const { value, min, max, isRange } = timesInfo;
  let predicate: (item: Statistic) => boolean = (item: Statistic) => item.times === value;

  if (isRange) {
    if (min) {
      predicate = (item) => min <= item.times;
    }

    if (max) {
      predicate = (item) => item.times <= max;
    }

    if (min && max) {
      predicate = (item) => min <= item.times && item.times <= max;
    }
  }

  const result = statistics.filter(predicate).reduce((sum, item) => sum + item.total_bookings, 0);

  return result;
};
