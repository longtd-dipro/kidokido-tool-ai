import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

import UserLayout from "components/common/UserLayout";
import { ROLE } from "constants/common";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { ROUTE } from "constants/route";
import Spinner from "components/common/Spinner";

function MyPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push(ROUTE.USER_HISTORY_BOOKINGS);
    }
  }, [user]);

  return (
    <UserLayout>
      <div className="text-center">
        <Spinner />
      </div>
    </UserLayout>
  );
}

export default withAuthentication(MyPage, [ROLE.USER]);
