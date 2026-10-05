import { yupResolver } from "@hookform/resolvers/yup";
import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";

import AdminLayout from "components/common/AdminLayout";
import Error from "components/common/Error";
import TextInputField from "components/common/Fields/TextInputField";
import Button from "components/common/Buttons/AdminButton";
import { ROLE } from "constants/common";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { waitingTimeSchema } from "libs/validation/schemas";
import { fetchAppSettingByKey, updateAppSetting } from "services/api-client/admin/app-setting.service";
import { NotificationType, showNotification } from "stores/reducers/notification";
import { MESSAGES } from "constants/messages";
import Label from "components/common/Admin/LabelFontLight";
import { APP_SETTING_KEY } from "constants/settings";
import { parseWaitingTimeSettings } from "utils/waiting-booking";

type FormData = {
  waitingTimeGroup1: number;
  waitingTimeGroup2: number;
  waitingTimeGroup3: number;
  waitingTimeGroup4: number;
};

function WaitingTimeManagement() {
  const [errMsg, setErrMsg] = useState<string>();
  const [settings, setSettings] = useState<number[]>();
  const dispatch = useDispatch();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(waitingTimeSchema)
  });

  const fetchData = async () => {
    const waitingTimeSettingsValue = await fetchAppSettingByKey(APP_SETTING_KEY.WAITING_TIME_IN_MINUTES);
    const waitingTimeSettingsInMinutes = parseWaitingTimeSettings(waitingTimeSettingsValue);
    setSettings(waitingTimeSettingsInMinutes);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (settings) {
      reset({
        waitingTimeGroup1: settings?.[0],
        waitingTimeGroup2: settings?.[1],
        waitingTimeGroup3: settings?.[2],
        waitingTimeGroup4: settings?.[3],
      });
    }
  }, [settings]);

  const onSubmit = async (values) => {
    setErrMsg("");
    try {
      await updateAppSetting({
        settingKey: APP_SETTING_KEY.WAITING_TIME_IN_MINUTES,
        value: [values.waitingTimeGroup1, values.waitingTimeGroup2, values.waitingTimeGroup3, values.waitingTimeGroup4].join(",")
      });
      dispatch(
        showNotification({
          type: NotificationType.SUCCESS,
          message: MESSAGES.CHANGE_WAITING_TIME_SUCCESSFUL,
        })
      );
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const onReset = async () => {
    reset();
    setErrMsg("");
  };

  return (
    <AdminLayout>
      <Box className="flex-1 w-4/5 mx-auto mt-[105px] justify-center ad-section-container">
        <div className="flex flex-col px-[35px] py-[120px]">
          <h2 className="flex justify-center mb-[34px] text-[20px] leading-[28px] font-bold">待機時間設定</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col max-w-[530px] mx-auto mb-[50px] gap-[35px]">
              {/*1 ~ 5 Group*/}
              <div className="flex justify-between">
                <Label isRequired={true} className="flex text-base leading-[20px] ad-text-color font-bold mt-3">待機1組〜5組</Label>
                <div className="flex flex-col">
                  <div className="flex">
                    <TextInputField
                      name="waitingTimeGroup1"
                      control={control}
                      placeholder="20"
                      type="number"
                      className="w-[200px] ad-input-field"
                      inputProps={{
                        maxLength: 256,
                      }}
                    />
                    <label className="mt-3 ml-[30px]">分間</label>
                  </div>
                  {errors.waitingTimeGroup1 && <Error message={errors.waitingTimeGroup1.message}/>}
                </div>
              </div>

              {/*6 ~ 10 Group*/}
              <div className="flex justify-between">
                <Label isRequired={true} className="flex text-base leading-[20px] ad-text-color font-bold mt-3">待機6組〜10組</Label>
                <div className="flex flex-col">
                  <div className="flex">
                    <TextInputField
                      name="waitingTimeGroup2"
                      control={control}
                      placeholder="30"
                      type="number"
                      className="w-[200px] ad-input-field"
                      inputProps={{
                        maxLength: 256,
                      }}
                    />
                    <label className="mt-3 ml-[30px]">分間</label>
                  </div>
                  {errors.waitingTimeGroup2 && <Error message={errors.waitingTimeGroup2.message} />}
                </div>
              </div>

              {/*11 ~ 20 Group*/}
              <div className="flex justify-between">
                <Label isRequired={true} className="flex text-base leading-[20px] ad-text-color font-bold mt-3">待機11組〜20組</Label>
                <div className="flex flex-col">
                  <div className="flex">
                    <TextInputField
                      name="waitingTimeGroup3"
                      control={control}
                      placeholder="45"
                      type="number"
                      className="w-[200px] ad-input-field"
                      inputProps={{
                        maxLength: 256,
                      }}
                    />
                    <label className="mt-3 ml-[30px]">分間</label>
                  </div>
                  {errors.waitingTimeGroup3 && <Error message={errors.waitingTimeGroup3.message} />}
                </div>
              </div>

              {/*21 ~ Group*/}
              <div className="flex justify-between">
                <Label isRequired={true} className="flex text-base leading-[20px] ad-text-color font-bold mt-3">待機21組以上</Label>
                <div className="flex flex-col">
                  <div className="flex">
                    <TextInputField
                      name="waitingTimeGroup4"
                      control={control}
                      placeholder="60"
                      type="number"
                      className="w-[200px] ad-input-field"
                      inputProps={{
                        maxLength: 256,
                      }}
                    />
                    <label className="mt-3 ml-[30px]">分間</label>
                  </div>
                  {errors.waitingTimeGroup4 && <Error message={errors.waitingTimeGroup4.message} />}
                </div>
              </div>
            </div>

            {/*Submit*/}
            <div className="flex justify-between max-w-[530px] mdonly:max-w-[400px] m-auto">
              <div className="flex ">
                <Button type="reset" variant="outlined" onClick={onReset} className="w-[200px] h-[48px] xs:w-[144px] xs:h-[36px] mdonly:w-[144px]">
                  リセット
                </Button>
              </div>
              <div className="flex">
                <Button type="submit" variant="contained" className="w-[200px] h-[48px] xs:w-[144px] xs:h-[36px] mdonly:w-[144px]">
                  保存する
                </Button>
              </div>
            </div>
          </form>

          {/*Error*/}
          <div className="flex justify-center mt-[15px]">
            <Error message={errMsg} />
          </div>
        </div>
      </Box>
    </AdminLayout>
  );
}

export default withAuthentication(WaitingTimeManagement, [ROLE.SUPER_ADMIN]);
