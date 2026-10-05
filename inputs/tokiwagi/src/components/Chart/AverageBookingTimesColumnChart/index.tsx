import { DesktopDatePicker } from "@mui/x-date-pickers";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { TextField } from "@mui/material";

import { CalendarIcon } from "statics/images/components/CalendarIcon";
import { SHORT_DATE } from "constants/common";
import { fetchAverageBookingTimes } from "services/api-client/admin/chart.service";
import Label from "components/common/Admin/Label";
import { Tenant } from "models/Entity";
import { getTenantByCode } from "utils/tenant";

const generateOptions = (data) => ({
  chart: {
    type: "column",
  },

  title: {
    text: "平均来店回数",
  },

  xAxis: {
    categories: [""],

    title: {
      align: "high",
      text: "各施設",
      style: {
        fontWeight: "bold",
      },
    },
  },

  yAxis: {
    title: {
      align: "high",
      offset: -30,
      rotation: 0,
      y: -15,
      text: "平均来店回数",
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

  series: data.map((item) => ({ name: item[0], data: [item[1]] })),
});

type Props = {
  tenants: Tenant[];
};

export default function AverageBookingTimesColumnChart({ tenants }: Props) {
  const [data, setData] = useState<any[]>(null);
  const [options, setOptions] = useState({});
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  const [totalDates, setTotalDates] = useState<number>(null);

  useEffect(() => {
    if (dateFrom && dateTo) {
      fetchData(dateFrom, dateTo);
      const diffOfDays = moment.duration(moment(dateTo).diff(dateFrom)).asDays();
      const totalDates = diffOfDays >= 0 ? diffOfDays + 1 : null;
      setTotalDates(totalDates);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    if (data) {
      setOptions(generateOptions(data));
    }
  }, [data]);

  const fetchData = async (dateFrom: string, dateTo: string) => {
    const statistics = await fetchAverageBookingTimes({ dateFrom, dateTo });
    const columnChartStatistic = statistics.map((item) => [getTenantByCode(item.tenant_code, tenants).name, item.ratio]);
    setData(columnChartStatistic);
  };

  return (
    <>
      <div className="flex md:grid md:grid-cols-1 gap-4 items-end justify-end mb-4">
        {/*Date From*/}
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

        {/*Date To*/}
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
        <p className="text-center mt-8">日付を選択してください</p>
      )}
    </>
  );
}
