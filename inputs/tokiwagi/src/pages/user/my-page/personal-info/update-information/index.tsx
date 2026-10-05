import { useEffect, useState } from "react";

import UserLayout from "components/common/UserLayout";
import UpdateUserForm from "components/User/UpdateUserForm";
import { ROLE } from "constants/common";
import { ROUTE } from "constants/route";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { fetchUser } from "services/api-client/user.service";
import { UserForm } from "models/UserForm";

function UpdateInformationUser() {
  const [user, setUser] = useState<UserForm>();
  const [heading, setHeading] = useState("アカウント情報の編集");

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChangeHeading = (heading: string) => {
    setHeading(heading);
  };

  const fetchData = async () => {
    try {
      const response = await fetchUser();
      setUser(response);
    } catch (err) {
      throw new err.response()?.data?.error || err.message;
    }
  };

  return (
    <UserLayout
      heading={heading}
      title="マイページ"
      breadcrumbItems={[
        { label: "トップ", href: ROUTE.INDEX },
        { label: "アカウント情報の確認・編集", href: ROUTE.USER_PERSONAL_INFO },
        { label: "アカウント情報編集", href: ROUTE.USER_EDIT_ACCOUNT },
      ]}
    >
      <section className="container lg:max-w-5xl w-full mx-auto">
        <div className="col-span-2">{user && <UpdateUserForm user={user} changeHeading={handleChangeHeading} onRefresh={fetchData} />}</div>
      </section>
    </UserLayout>
  );
}

export default withAuthentication(UpdateInformationUser, [ROLE.USER]);
