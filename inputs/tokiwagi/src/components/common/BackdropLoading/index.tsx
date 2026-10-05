import { Backdrop, CircularProgress } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import { selectBackdropLoading } from "stores/reducers/backdrop-loading";
import { hideNotification } from "stores/reducers/notification";

export default function BackdropLoading() {
  const { isShow } = useSelector(selectBackdropLoading());
  const dispatch = useDispatch();

  const handleClose = () => {
    dispatch(hideNotification());
  };

  return (
    <Backdrop open={isShow} onClick={handleClose}>
      <CircularProgress className="text-white" />
    </Backdrop>
  );
}
