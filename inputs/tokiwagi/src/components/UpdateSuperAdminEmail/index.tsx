import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@mui/material";
import { useSession } from "next-auth/react";

import { emailSchema } from "libs/validation/schemas";
import TextInputField from "components/common/Fields/TextInputField";
import Error from "components/common/Error";
import { changeEmail } from "services/api-client/auth.service";

type FormData = {
  email: string;
};

export default function UpdateSuperAdminEmail() {
  const [errMsg, setErrMsg] = useState<string>();
  const { data: session } = useSession();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(emailSchema),
    defaultValues: { email: session.user.email },
  });

  const onSubmit = async (values) => {
    setErrMsg("");
    try {
      await changeEmail(values);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  return (
    <div className="relative z-10 flex flex-col w-1/3 p-8 mx-auto mt-10 bg-white rounded-lg shadow-md h-full">
      <h2 className="mb-1 text-lg font-medium text-gray-900 title-font">Change Email</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/*Email*/}
        <div className="relative mb-4">
          <label htmlFor="newPassword" className="text-sm leading-7 text-gray-600">
            Email
            <TextInputField
              name="email"
              control={control}
              type="text"
              className="w-full px-3 py-1 text-base leading-8 text-gray-700 transition-colors 
            duration-200 ease-in-out bg-white border border-gray-300 rounded outline-none focus:border-indigo-500 
            focus:ring-2 focus:ring-indigo-200"
            />
          </label>
          {errors.email && <Error message={errors.email.message} />}
        </div>

        {/*Submit*/}
        <Button
          type="submit"
          variant="contained"
          className="px-6 py-2 text-lg text-white bg-indigo-500 border-0 rounded focus:outline-none hover:bg-indigo-600"
        >
          Save
        </Button>
      </form>

      {/*Error*/}
      <Error message={errMsg} />
    </div>
  );
}
