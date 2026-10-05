import { yupResolver } from "@hookform/resolvers/yup";
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { SecurityQuestion } from "@prisma/client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import Label from "components/common/Admin/Label";
import UserSiteLoadingButton from "components/common/Buttons/LoadingButton";
import Error from "components/common/Error";
import AutocompleteField from "components/common/Fields/AutocompleteField";
import TextInputField from "components/common/Fields/TextInputField";
import Spinner from "components/common/Spinner";
import { ROUTE } from "constants/route";
import { getForbiddenRedirect } from "utils/forbiddenSignIn";
import { confirmSecurityAnswerSchema } from "libs/validation/securityAnswerSchema";
import { fetchSecurityQuestions } from "services/api-client/auth.service";
import { ERROR_MESSAGES } from "constants/errors";

type Props = {
  email: string;
  password: string;
  onLockAdmin: () => void;
  onLockSuperAdmin: () => void;
};

type FormData = {
  question: SecurityQuestion;
  answer: string;
};

const DEFAULT_FORM_DATA = {
  question: null,
  answer: "",
};

export default function AdminConfirmSecurityAnswerDialog({ email, password, onLockAdmin, onLockSuperAdmin }: Props) {
  // State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errMsg, setErrMsg] = useState<string>();
  const [securityQuestions, setSecurityQuestions] = useState<SecurityQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Variable
  const router = useRouter();
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(confirmSecurityAnswerSchema),
    defaultValues: DEFAULT_FORM_DATA,
  });

  // Effect
  useEffect(() => {
    fetchData();
  }, []);

  // Function
  const onSubmit = async (data: FormData) => {
    try {
      setErrMsg("");
      setIsSubmitting(true);
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        questionId: data.question.id,
        enteredAnswer: data.answer,
      });

      // signIn bypasses the axios 403 interceptor, so handle an IP-block 403 here.
      const forbiddenRedirect = getForbiddenRedirect(result);
      if (forbiddenRedirect) {
        router.push(forbiddenRedirect);
        return;
      }

      const error = result?.error;
      if (error) {
        if (error === ERROR_MESSAGES.LOCKED_ADMIN) {
          onLockAdmin();
          return;
        }

        if (error === ERROR_MESSAGES.LOCKED_SUPER_ADMIN) {
          onLockSuperAdmin();
          return;
        }

        setErrMsg(error);
      } else {
        router.push((router.query.redirect as string) || ROUTE.ADMIN_INDEX);
      }
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchData = async () => {
    try {
      setErrMsg("");
      setLoading(true);

      const questions = await fetchSecurityQuestions();
      setSecurityQuestions(questions);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setLoading(false);
    }
  };

  // Render
  return (
    <Dialog
      disablePortal
      open={true}
      scroll="paper"
      className={"max-w-[800px] min-w-unset my-auto xsup:w-full mx-auto xs:mx-5"}
      PaperProps={{
        className: "!max-w-[unset]",
      }}
    >
      <DialogTitle id="scroll-dialog-title">
        <span className="block font-bold text-xl">秘密の質問</span>
        <span className="text-base">秘密の質問は第三者が不正にログインすることを防ぐために使用します。</span>
      </DialogTitle>
      <DialogContent className="!px-8 !py-4 w-full" dividers>
        {loading && <Spinner className="block mx-auto" />}

        {!loading && (
          <form>
            <div className="mb-4">
              <Label isRequired={true} className="block mb-2">
                質問を選択してください。
              </Label>
              <AutocompleteField
                name="question"
                control={control}
                options={securityQuestions}
                getOptionLabel={(option) => option.question || ""}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    className="ad-input-field w-full font-medium"
                    error={!!errors.answer}
                    inputProps={{ ...params.inputProps, readOnly: true }}
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                disableClearable
              />
              {errors.question && <Error message={errors.question["message"]} className="mt-1" />}
            </div>

            <div className="mb-4">
              <Label isRequired={true} className="block mb-2">
                回答を入力してください。
              </Label>
              <TextInputField
                name="answer"
                control={control}
                className="w-full ad-input-field"
                inputProps={{
                  className: "border-0 ad-input-field",
                  maxLength: 256,
                }}
              />
              {errors.answer && <Error message={errors.answer.message} className="mt-1" />}
            </div>
          </form>
        )}

        {/*Error*/}
        <div className="mt-4">
          <Error message={errMsg} />
        </div>
      </DialogContent>

      <DialogActions>
        <UserSiteLoadingButton
          isLoading={isSubmitting}
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          className="!w-[300px] h-[56px] xs:!w-[120px] xs:h-[48px]"
        >
          次へ
        </UserSiteLoadingButton>
      </DialogActions>
    </Dialog>
  );
}
