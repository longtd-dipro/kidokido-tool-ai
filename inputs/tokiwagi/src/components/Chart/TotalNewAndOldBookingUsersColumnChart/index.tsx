import { FormControl, MenuItem, Select, TextField } from "@mui/material";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import moment from "moment";
import { useEffect, useState } from "react";

import Label from "components/common/Admin/Label";
import { SHORT_DATE, SHORT_DATE_WITHOUT_YEARS } from "constants/common";
import { Tenant } from "models/Entity";
import { fetchTotalNewAndOldBookingUsers } from "services/api-client/admin/chart.service";
import { fetchTenants } from "services/api-client/admin/tenant.service";
import { CalendarIcon } from "statics/images/components/CalendarIcon";
import { getTenantByCode } from "utils/tenant";

const generateOptions = (dates, data) => ({
  chart: {
    type: "column",
  },
  title: {
    text: "人数",
  },
  xAxis: {
    categories: dates,
  },
  yAxis: {
    min: 0,
    title: {
      text: "人数",
      align: "high",
      offset: 10,
      rotation: 0,
      y: -15,
      style: {
        fontWeight: "bold",
      },
    },
  },
  plotOptions: {
    column: {
      pointPadding: 0.2,
      borderWidth: 0,
    },
  },
  series: data,
});

export default function TotalNewAndOldBookingUsersColumnChart() {
  const [data, setData] = useState<any[]>(null);
  const [dates, setDates] = useState([]);
  const [options, setOptions] = useState({});
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantCode, setTenantCode] = useState("");
  const [totalDates, setTotalDates] = useState<number>(null);

  useEffect(() => {
    dates && data && setOptions(generateOptions(dates, data));
  }, [dates, data]);

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
    const statistics = await fetchTotalNewAndOldBookingUsers({ dateFrom, dateTo, tenantCode });
    if (statistics.length === 0) {
      return setData([]);
    }

    const newUserBookings = { name: "新規利用者数", data: [], color: "#006DC6" };
    const oldUserBookings = { name: "リピート利用者数", data: [], color: "#EED200" };

    statistics.forEach((item) => {
      newUserBookings.data.push(item.totalNewUsers);
      oldUserBookings.data.push(item.totalOldUsers);
    });

    const columnChartStatistic = [newUserBookings, oldUserBookings];

    setData(columnChartStatistic);
    setDates(statistics.map((item) => moment(item.date).format(SHORT_DATE_WITHOUT_YEARS)));
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
      <div className="flex gap-4 mb-4 justify-end">
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
