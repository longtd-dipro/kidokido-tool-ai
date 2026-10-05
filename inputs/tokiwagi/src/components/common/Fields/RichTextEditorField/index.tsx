import dynamic from "next/dynamic";
import React from "react";
import { Control , Controller } from "react-hook-form";
import { ReactQuillProps } from "react-quill/lib";
import "react-quill/dist/quill.snow.css";
import { QuillHtmlEditButtonOptions } from "quill-html-edit-button";

const FONT_SIZES = [
  "9px",
  "10px",
  "11px",
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "22px",
  "24px",
  "26px",
  "28px",
];

const ReactQuillEditor = dynamic(async () => {
  const { default: RQ } = await import("react-quill");
  const { htmlEditButton } = require("quill-html-edit-button");
  // @ts-ignore
  RQ.Quill.register({
    "modules/htmlEditButton": htmlEditButton
  });

  // @ts-ignore
  const Size = RQ.Quill.import("attributors/style/size");
  Size.whitelist = FONT_SIZES;
  // @ts-ignore
  RQ.Quill.register(Size, true);

  return RQ;
}, {
  ssr: false
});

interface Props extends ReactQuillProps {
  name: string;
  control: Control<any>;
  htmlEditButton?: QuillHtmlEditButtonOptions
}

export default function RichTextEditorField(props: Props) {
  const { name, control, defaultValue, htmlEditButton = {}, ...reactQuillProps } = props;
  const defaultValueInput = defaultValue !== undefined ? defaultValue : "";

  return (
    <Controller
      name={name}
      defaultValue={defaultValueInput}
      control={control}
      render={({ field }) => {
        const { value, ...rest } = field;
        return <ReactQuillEditor
          {...reactQuillProps}
          {...rest}
          defaultValue={value}
          preserveWhitespace={true}
          theme="snow"
          formats={FORMATS}
          modules={{ ...MODULES, htmlEditButton }}
        />;
      }}
    />
  );
}

const MODULES = {
  toolbar: {
    container: [
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ size: FONT_SIZES }, { color: [] }],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
        { align: [] }
      ],
      ["link", "image", "video"],
      ["clean"]
    ]
  },
  clipboard: { matchVisual: false }
};

const FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "size",
  "color",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
  "video",
  "align"
];
