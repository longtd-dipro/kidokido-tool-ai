import * as React from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import DisclaimerTermsCheckbox from "components/CreateBooking/DisclaimerTermsCheckbox";

export interface Props {
  groupIndex: number;
}

export default function DisclaimerTermsCheckboxGroup({ groupIndex }: Props) {
  const { control } = useFormContext();

  const title = useWatch({
    name: `disclaimers.${groupIndex}.title`,
    control,
  });

  const { fields } = useFieldArray({
    control,
    name: `disclaimers.${groupIndex}.options`,
  });

  return (
    <div>
      <p className={`px-10 xs:px-4 my-5 font-light ${groupIndex == 0 ? "text-center" : "text-left"} whitespace-pre-line`}>{title}</p>
      {fields.map((field, index) => (
        <DisclaimerTermsCheckbox value={`disclaimers.${groupIndex}.options.${index}.value`} groupIndex={groupIndex} checkboxIndex={index} key={field.id} />
      ))}
    </div>
  );
}
