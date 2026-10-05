import { TextField } from "@mui/material";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useEffect, useState } from "react";
import moment from "moment";

import { CalendarIcon } from "statics/images/components/CalendarIcon";
import { LONG_TIME, SHORT_DATE } from "constants/common";
import { fetchAverageStayDuration } from "services/api-client/admin/chart.service";
import Label from "components/common/Admin/Label";
import { Tenant } from "models/Entity";
import { getTenantByCode } from "utils/tenant";
import { formatHourDuration } from "utils/date-time";

const generateOptions = (xCategories, data) => ({
  chart: {
    type: "line",
  },

  title: {
    text: "平均滞在時間",
  },

  tooltip: {
    formatter() {
      return `<span>${this.point.name}</span><br/>
        <h2 style="font-size: 14px;">
          <span style="color: ${this.color}">•</span> ${this.point.series.name}: <b>${formatHourDuration(this.y, LONG_TIME)}</b>
        </h2>`;
    },
  },

  xAxis: {
    categories: xCategories,
    title: {
      align: "high",
      text: "日付",
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
      text: "平均滞在時間 (h)",
      style: {
        fontWeight: "bold",
      },
    },
  },

  series: data,
});

type Props = {
  tenants: Tenant[];
};

export default function AverageStayDurationLineChart({ tenants }: Props) {
  const [data, setData] = useState<any[]>();
  const [xCategories, setXCategories] = useState();
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
    if (data && xCategories) {
      const populatedData = populateSeriesDataByCategories(xCategories, data);
      setOptions(generateOptions(xCategories, populatedData));
    }
  }, [data, xCategories]);

  const fetchData = async (dateFrom: string, dateTo: string) => {
    const statistics = await fetchAverageStayDuration({ dateFrom, dateTo });

    const lineChartStatistics = statistics.map(({ data, name }) => ({
      name: getTenantByCode(name, tenants).name,
      data: data.map((item) => ({ name: item[0], y: item[1] })),
      type: "line",
    }));
    const categories = getCategories(statistics);

    setXCategories(categories as any);
    setData(lineChartStatistics);
  };

  return (
    <>
      <div className="flex gap-4 items-end justify-end mb-4 ">
        {/* Start Date */}
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
        data.length !== 0 ? (
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

const getCategories = (statistics: any) => {
  let categories = new Set();
  statistics.forEach(({ data }) => {
    data.forEach((item) => {
      categories.add(item[0]);
    });
  });
  return Array.from(categories).sort();
};

const populateSeriesDataByCategories = (xCategories, data) => {
  data.forEach((tenant) => {
    const tenantData = [];
    xCategories.forEach((categoryItem) => {
      const y = tenant.data.find((dateItem) => dateItem.name === categoryItem)?.y || null;
      tenantData.push({
        name: categoryItem,
        y,
        dataLabels: {
          enabled: true,
          formatter() {
            return formatHourDuration(this.y, LONG_TIME);
          },
        },
      });
    });

    tenant.data = tenantData;
  });

  return data;
};
