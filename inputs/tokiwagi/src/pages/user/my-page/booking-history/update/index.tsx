import router from "next/router";
import { useEffect } from "react";

import { ROUTE } from "constants/route";

export default function UserUpdateBooking() {
  useEffect(() => { 
    router.replace(ROUTE.USER_HISTORY_BOOKINGS);
  }, []);

  return null;
}