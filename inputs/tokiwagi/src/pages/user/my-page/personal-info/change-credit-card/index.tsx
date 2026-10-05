import UserLayout from "components/common/UserLayout";
import UpdateCreditCardForm from "components/User/UpdateCreditCardForm";
import { ROLE } from "constants/common";
import { ROUTE } from "constants/route";
import { withAuthentication } from "libs/hoc/withAuthentication";

function ChangeCreditCard() {
  return (
    <div className="user mb-14">
      <UserLayout
        heading="クレジットカード情報の編集"
        title="マイページ"
        breadcrumbItems={[
          { label: "トップ", href: ROUTE.INDEX },
          { label: "アカウント情報の確認・編集", href: ROUTE.USER_PERSONAL_INFO },
          { label: "お支払い方法編集", href: ROUTE.USER_EDIT_CREDIT_CARD },
        ]}
      >
        <section className="xs:mx-5 mx-auto">
          <UpdateCreditCardForm />
        </section>
      </UserLayout>
    </div>
  );
}

export default withAuthentication(ChangeCreditCard, [ROLE.USER]);
