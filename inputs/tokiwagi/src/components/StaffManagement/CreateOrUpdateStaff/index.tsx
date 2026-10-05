import { yupResolver } from "@hookform/resolvers/yup";
import { Grid, TextField } from "@mui/material";
import { Role } from "@prisma/client";
import { cloneDeep } from "lodash";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import Label from "components/common/Admin/Label";
import AdminButton from "components/common/Buttons/AdminButton";
import Error from "components/common/Error";
import AutocompleteField from "components/common/Fields/AutocompleteField";
import PasswordInputField from "components/common/Fields/PasswordInputField";
import TextInputField from "components/common/Fields/TextInputField";
import Spinner from "components/common/Spinner";
import { ROLE } from "constants/common";
import { staffSchema } from "libs/validation/staffSchema";
import { Staff, Tenant } from "models/Entity";
import { createStaff, updateStaff } from "services/api-client/admin/staff.service";
import { fetchTenants } from "services/api-client/admin/tenant.service";
import { getStaffRoleLabel } from "utils/user";
import UserSiteLoadingButton from "components/common/Buttons/LoadingButton";

interface Props {
  staff?: Staff;
  onCancel: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}

type UserFormData = {
  id: string;
  lastName: string;
  firstName: string;
  lastNameFurigana: string;
  firstNameFurigana: string;
  password: string;
  tenantCode: string;
  role: Role;
};

export default function CreateOrUpdateStaff({ staff, onCancel, onSuccess, onError }: Props) {
  // Variable
  const { data: session } = useSession();
  const isAdminRole = session.user.role === ROLE.ADMIN;
  const isEditMode = !!staff;

  const transformStaffDefaultValues = (staff?: Staff) => {
    let result: any = {};

    if (staff) {
      const { tenantCode, id } = staff;
      result = cloneDeep(staff);
      result.id = id.replace(tenantCode.toLowerCase(), "");

      delete result.Tenant;
      delete result.updatedAt;
      delete result.createdAt;
    } else {
      isAdminRole && (result.tenantCode = session.user.tenantCode);
    }

    return result;
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: yupResolver(staffSchema),
    defaultValues: transformStaffDefaultValues(staff),
  });

  // State
  const [errMsg, setErrMsg] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  // Effect
  useEffect(() => {
    fetchData();
  }, []);

  // Function
  const fetchData = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const results = await fetchTenants();
      setTenants(results);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const prepareDataToSubmit = (data: UserFormData) => {
    const { tenantCode, id } = data;
    return { ...data, id: `${tenantCode.toLowerCase()}${id}` };
  };

  const onSubmit = async (data: UserFormData) => {
    const dataToSubmit = prepareDataToSubmit(data);
    try {
      setIsSubmitting(true);
      if (isEditMode) {
        await updateStaff(staff.id, dataToSubmit);
      } else {
        await createStaff(dataToSubmit);
      }

      onSuccess();
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      onError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {!loading && (
        <>
          <div className="relative px-16 mt-6">
            <Grid container spacing={4}>
              {/* Tenant */}
              <Grid item xs={6}>
                <Label className="text-base min-w-[230px] text-right md:min-w-[180px]" isRequired={true}>
                  <span className="mr-2">店舗</span>
                </Label>
                <div className="min-w-[256px] mt-2">
                  <AutocompleteField
                    disablePortal
                    name="tenantCode"
                    control={control}
                    options={tenants.map((tenant) => tenant?.code)}
                    getOptionLabel={(option) => tenants?.find((item) => item.code === option)?.name || ""}
                    renderInput={(params) => (
                      <TextField {...params} placeholder="ボーネルンド渋谷店" className="ad-input-field w-[256px] font-medium" error={!!errors.tenantCode} />
                    )}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    disabled={isAdminRole}
                    disableClearable
                  />
                </div>
                {errors.tenantCode && <Error message={errors.tenantCode.message} className="mt-1" />}
              </Grid>

              {/* ID */}
              <Grid item xs={6}>
                <Label isRequired={true}>従業員ID</Label>
                <div className="mt-2 flex gap-4">
                  <TextInputField
                    name="tenantCode"
                    control={control}
                    className={"w-[120px] px-3 py-1 ad-input-field"}
                    inputProps={{
                      style: { textTransform: "lowercase" },
                    }}
                    disabled={true}
                  />
                  <TextInputField
                    name="id"
                    control={control}
                    className={`${STYLES.INPUT_FIELD}`}
                    placeholder="従業員IDを入力"
                    type="number"
                    onInput={(e) => {
                      const MAX_LENGTH = 4;
                      const value = (e.target as HTMLInputElement).value;

                      const sanitizedValue = value.replace(/[.-]/g, "");
                      (e.target as HTMLInputElement).value = sanitizedValue.toString().slice(0, MAX_LENGTH);
                    }}
                  />
                </div>
                {errors.id && <Error message={errors.id.message} className="mt-1" />}
              </Grid>
            </Grid>
          </div>

          <div className="relative px-16 mt-6">
            <Grid container spacing={4}>
              {/* Password */}
              <Grid item xs={6}>
                <Label htmlFor="password" isRequired={true}>
                  パスワード
                </Label>
                <div className="mt-2">
                  <PasswordInputField
                    id="password"
                    name="password"
                    className="w-full ad-input-field"
                    placeholder="パスワードを入力"
                    control={control}
                    inputProps={{
                      maxLength: 256,
                    }}
                  />
                </div>
                {errors.password && <Error message={errors.password.message} className="mt-1" />}
              </Grid>

              {/* Role */}
              <Grid item xs={6}>
                <Label htmlFor="role" isRequired={true}>
                  権限
                </Label>
                <div className="mt-2">
                  <AutocompleteField
                    id="role"
                    disablePortal
                    name="role"
                    control={control}
                    options={[ROLE.ADMIN, ROLE.STAFF]}
                    getOptionLabel={(option) => getStaffRoleLabel(option) || ""}
                    renderInput={(params) => (
                      <TextField {...params} placeholder="従業員" className="ad-input-field w-[256px] font-medium" error={!!errors.tenantCode} />
                    )}
                  />
                </div>
                {errors.role && <Error message={errors.role.message} className="mt-1" />}
              </Grid>
            </Grid>
          </div>

          {/*  First Name Last Name */}
          <div className="relative px-16 mt-6">
            <Grid container spacing={4}>
              {/* Last Name */}
              <Grid item xs={6}>
                <Label htmlFor="lastName" isRequired={true}>
                  姓
                </Label>
                <div className="mt-2">
                  <TextInputField
                    id="lastName"
                    name="lastName"
                    control={control}
                    inputProps={{ maxLength: 256 }}
                    className={`${STYLES.INPUT_FIELD}`}
                    placeholder="山田"
                  />
                </div>
                {errors.lastName && <Error message={errors.lastName.message} className="mt-1" />}
              </Grid>

              {/* First Name */}
              <Grid item xs={6}>
                <Label htmlFor="firstName" isRequired={true}>
                  名
                </Label>
                <div className="mt-2">
                  <TextInputField
                    id="firstName"
                    name="firstName"
                    control={control}
                    inputProps={{ maxLength: 256 }}
                    className={`${STYLES.INPUT_FIELD}`}
                    placeholder="太郎"
                  />
                </div>
                {errors.firstName && <Error message={errors.firstName.message} className="mt-1" />}
              </Grid>
            </Grid>
          </div>

          {/*  First Name Last Name Katakana */}
          <div className="relative px-16 mt-6">
            <Grid container spacing={4}>
              {/* First Name */}
              <Grid item xs={6}>
                <Label htmlFor="lastNameFurigana" isRequired={true}>
                  姓（フリガナ）
                </Label>
                <div className="mt-2">
                  <TextInputField
                    id="lastNameFurigana"
                    name="lastNameFurigana"
                    control={control}
                    className={`${STYLES.INPUT_FIELD}`}
                    inputProps={{ maxLength: 256 }}
                    placeholder="ヤマダ"
                  />
                </div>
                {errors.lastNameFurigana && <Error message={errors.lastNameFurigana.message} className="mt-1" />}
              </Grid>

              {/* Last Name */}
              <Grid item xs={6}>
                <Label htmlFor="firstNameFurigana" isRequired={true}>
                  名（フリガナ）
                </Label>
                <div className="mt-2">
                  <TextInputField
                    id="firstNameFurigana"
                    name="firstNameFurigana"
                    control={control}
                    className={`${STYLES.INPUT_FIELD}`}
                    inputProps={{ maxLength: 256 }}
                    placeholder="タロウ"
                  />
                </div>
                {errors.firstNameFurigana && <Error message={errors.firstNameFurigana.message} className="mt-1" />}
              </Grid>
            </Grid>
          </div>

          <div className="flex justify-center gap-x-20 mt-14">
            <AdminButton type="button" onClick={onCancel} variant="outlined" className="w-[230px] h-[56px] mdonly:w-[170px] !font-bold">
              キャンセル
            </AdminButton>
            <UserSiteLoadingButton isLoading={isSubmitting} type="submit" variant="contained" className="w-[230px] h-[56px] mdonly:w-[170px] !font-bold">
              保存する
            </UserSiteLoadingButton>
          </div>
        </>
      )}

      <div className="flex justify-center mt-8">
        <Error message={errMsg} />
      </div>

      {loading && (
        <div className="flex justify-center pb-12">
          <Spinner />
        </div>
      )}
    </form>
  );
}

const STYLES = {
  INPUT_FIELD: "w-full px-3 py-1 ad-input-field",
  RADIO: "inline-block",
};
