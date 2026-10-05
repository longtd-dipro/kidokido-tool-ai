import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
import { useRouter } from "next/router";

import AdminLayout from "components/common/AdminLayout";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { ROLE } from "constants/common";
import Spinner from "components/common/Spinner";
import { ROUTE } from "constants/route";

function Admin() {
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (user.role === ROLE.ADMIN) {
        // Admin
        router.push(ROUTE.BOOKING_MANAGEMENT);
      } else {
        // Super Admin
        router.push(ROUTE.DASHBOARD);
      }
    }
  }, [user]);

  return <AdminLayout>
    <div className="text-center">
      <Spinner />
    </div>
  </AdminLayout>;
}

export default withAuthentication(Admin, [ROLE.ADMIN, ROLE.SUPER_ADMIN]);
