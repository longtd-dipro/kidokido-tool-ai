import * as React from "react";
import CircularProgress, { CircularProgressProps } from "@mui/material/CircularProgress";

export default function Spinner(props: CircularProgressProps) {
  return <CircularProgress {...props} />;
}
