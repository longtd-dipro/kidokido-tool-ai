import { Alert, Snackbar } from "@mui/material";
import * as React from "react";
import Image from "next/legacy/image";
import { useDispatch, useSelector } from "react-redux";

import AlertSuccess from "statics/images/alert-success.svg";
import AlertError from "statics/images/alert-error.svg";
import AlertWarning from "statics/images/alert-warning.svg";
import {
  hideNotification,
  NotificationTitle,
  NotificationType,
  selectNotification,
} from "stores/reducers/notification";

const NOTIFICATION_AUTO_HIDE_DURATION = 6000; // milliseconds

export default function Notification() {
  const {
    isShow,
    info: { message, type, title },
  } = useSelector(selectNotification());
  const dispatch = useDispatch();

  const handleClose = () => {
    dispatch(hideNotification());
  };

  const getIcon = () => {
    if (type === NotificationType.SUCCESS) {
      return <Image src={AlertSuccess} alt="success" />;
    } else if (type === NotificationType.ERROR) {
      return <Image src={AlertError} alt="error" />;
    }
    return <Image src={AlertWarning} alt="warning" />;
  };

  return (
    <Snackbar
      open={isShow}
      autoHideDuration={NOTIFICATION_AUTO_HIDE_DURATION}
      onClose={handleClose}
      anchorOrigin={{ horizontal: "right", vertical: "top" }}
    >
      <Alert
        onClose={handleClose}
        icon={getIcon()}
        severity={type}
        sx={{
          width: "100%",
          backgroundColor: "#FFFFFF",
          borderRadius: "10px",
          boxShadow:
            "0px 4px 8px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.2);",
        }}
        
      >
        <p>{title ?? NotificationTitle[type]}</p>
        {message}
      </Alert>
    </Snackbar>
  );
}
