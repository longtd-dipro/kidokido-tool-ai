import * as React from "react";
import CircularProgress, { CircularProgressProps } from "@mui/material/CircularProgress";

export default function LoadingSpinner(props: CircularProgressProps) {
  return (
    <div className="flex justify-center items-center mt-8">
      <CircularProgress {...props} />
    </div>
  );
}
