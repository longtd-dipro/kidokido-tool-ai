import Image from "next/image";
import React, { useId, useRef } from "react";
import {
  Control,
  Controller,
  FieldValues,
  Path,
} from "react-hook-form";
import { useDispatch } from "react-redux";

import ExportIcon from "statics/images/export.svg";
import XIcon from "statics/images/x.svg";
import Error from "components/common/Error";
import {
  NotificationType,
  showNotification,
} from "stores/reducers/notification";

type Props<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  isRequired?: boolean;
  accept?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  iconUpload?: string;
  iconRemove?: string;
  error?: string;
  isShowError?: boolean;
  onFileSelected?: (file: File | null) => void;
  maxSizeMB?: number;
};

export default function FileUploadField<T extends FieldValues>({
  name,
  control,
  label,
  isRequired = false,
  accept = "*",
  placeholder = "",
  className = "",
  disabled = false,
  iconUpload,
  iconRemove,
  error,
  isShowError = false,
  onFileSelected,
  maxSizeMB = 20,
}: Props<T>) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dispatch = useDispatch();

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const getDisplayFileName = (value: File | string | null | undefined) => {
    if (value instanceof File) return value.name;
    if (typeof value === "string") return value;
    return "";
  };

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={null as any}
      render={({ field, fieldState }) => {
        const value = field.value as File | string | null | undefined;
        const fileName = getDisplayFileName(value);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];

          if (!file) return;

          if (file.size > maxSizeBytes) {
            const message = `画像は${maxSizeMB}MB以下でアップロードしてください。`;

            dispatch(
              showNotification({
                type: NotificationType.ERROR,
                message,
              })
            );

            e.target.value = "";
            return;
          }

          field.onChange(file);
          onFileSelected?.(file);

          e.target.value = "";
        };

        const handleRemove = (
          e: React.MouseEvent<HTMLButtonElement, MouseEvent>
        ) => {
          e.preventDefault();
          e.stopPropagation();

          field.onChange(null);
          onFileSelected?.(null);

          if (inputRef.current) {
            inputRef.current.value = "";
          }
        };

        return (
          <div className={`min-w-0 w-full ${className}`}>
            {label && (
              <label className="mb-2 block text-base">
                {label}
                {isRequired && <span className="ml-1 text-red-500">*</span>}
              </label>
            )}

            <div className="min-w-0 w-full h-full overflow-hidden">
              <label
                htmlFor={inputId}
                className={`
                  flex h-full min-w-0 w-full items-center gap-2 overflow-hidden border border-[#D9D9D9] bg-white px-3 py-2
                  ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
                `}
              >
                <div className="w-0 flex-1 overflow-hidden">
                  <span className="block truncate whitespace-nowrap">
                    {fileName || placeholder}
                  </span>
                </div>

                {fileName ? (
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="shrink-0"
                    disabled={disabled}
                  >
                    <Image
                      src={iconRemove || XIcon}
                      alt="remove"
                      width={20}
                      height={20}
                    />
                  </button>
                ) : (
                  <div className="shrink-0">
                    <Image
                      src={iconUpload || ExportIcon}
                      alt="upload"
                      width={20}
                      height={20}
                    />
                  </div>
                )}
              </label>

              <input
                ref={inputRef}
                id={inputId}
                type="file"
                accept={accept}
                onChange={handleChange}
                disabled={disabled}
                className="hidden"
              />
            </div>

            {isShowError && (fieldState.error?.message || error) && (
              <div className="mt-2">
                <Error message={fieldState.error?.message || error} />
              </div>
            )}
          </div>
        );
      }}
    />
  );
}