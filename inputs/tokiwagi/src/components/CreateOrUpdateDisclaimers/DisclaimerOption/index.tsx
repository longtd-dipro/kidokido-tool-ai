import { useFormContext } from "react-hook-form";
import { Button } from "@mui/material";
import Image from "next/legacy/image";

import TextInputField from "components/common/Fields/TextInputField";
import AddCircle from "statics/images/add-circle-black.svg";
import MinusCircle from "statics/images/minus-circle.svg";
import Error from "components/common/Error";

import styles from "./index.module.scss";

type Props = {
  optionIndex: number;
  name: string;
  isDisableDeleteOptionButton: boolean;
  errorMsg?: string;
  onDeleteOption: (optionIndex: number) => void;
  onInsertOption: (optionIndex: number) => void;
};

const DisclaimerOption = ({ optionIndex, name, isDisableDeleteOptionButton, errorMsg, onDeleteOption, onInsertOption }: Props) => {
  const { control } = useFormContext();

  return (
    <div>
      <div className="flex gap-2 justify-between w-full">
        <TextInputField
          name={name}
          control={control}
          placeholder="チェックボックスになるテキストを入力してください"
          inputProps={{ className: "ad-input-field px-4 py-3 font-medium", maxLength: 256 }}
          className="w-3/4 ad-input-field"
        />

        <div className="flex gap-4 md:gap-2">
          <Button className={styles.action_button} type="button" onClick={() => onInsertOption(optionIndex)}>
            <Image src={AddCircle} alt="add" />
          </Button>
          <Button className={styles.action_button} type="button" onClick={() => onDeleteOption(optionIndex)} disabled={isDisableDeleteOptionButton}>
            <Image src={MinusCircle} alt="minus" />
          </Button>
        </div>
      </div>

      {errorMsg && <Error className="mt-2" message={errorMsg} />}
    </div>
  );
};

export default DisclaimerOption;
