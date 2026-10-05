import { Ticket } from "@prisma/client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { ROLE } from "constants/common";
import AdminLayout from "components/common/AdminLayout";
import AdminButton from "components/common/Buttons/AdminButton";
import Error from "components/common/Error";
import Spinner from "components/common/Spinner";
import ViewTicket from "components/Ticket/ViewTicket";
import { fetchTicketById } from "services/api-client/admin/ticket.service";
import { confirmPassword } from "utils/ui";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { getUrlQueryValue } from "utils/url";
import { ROUTE } from "constants/route";

function ViewTicketPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [errMsg, setErrMsg] = useState<string>();
  const [ticket, setTicket] = useState<Ticket>();
  const [loading, setLoading] = useState<boolean>(false);

  const { ticketId } = router.query;
  const page = getUrlQueryValue("page");
  const filters = getUrlQueryValue("filters");

  useEffect(() => {
    ticketId && fetchData(+ticketId);
  }, [ticketId]);

  const fetchData = async (ticketId: number) => {
    try {
      setErrMsg("");
      setLoading(true);
      const ticket = await fetchTicketById(ticketId, {
        includeSlaveTickets: true,
      });
      setTicket(ticket);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRedirectToManagement = () => {
    router.push({
      pathname: ROUTE.TICKET_MANAGEMENT,
      query: { page, filters },
    });
  };

  const handleRedirectToEdit = async () => {
    try {
      await confirmPassword(dispatch);
      router.push({
        pathname: `${ROUTE.EDIT_TICKET}/${ticketId}`,
        query: { page, filters },
      });
    } catch (e) {
      // Nothing here
    }
  };

  return (
    <AdminLayout>
      <section className="pt-16 pb-24 ad-section-container">
        {/*Error*/}
        <Error message={errMsg} />

        {!loading && ticket && <ViewTicket ticket={ticket} />}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center mb-12">
            <Spinner />
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-center gap-24">
          <AdminButton
            variant="outlined"
            onClick={handleRedirectToManagement}
            className="w-[250px] h-[60px]"
          >
            戻る
          </AdminButton>
          <AdminButton
            variant="contained"
            onClick={handleRedirectToEdit}
            className="w-[250px] h-[60px]"
          >
            編集する
          </AdminButton>
        </div>
      </section>
    </AdminLayout>
  );
}

export default withAuthentication(ViewTicketPage, [
  ROLE.SUPER_ADMIN,
  ROLE.ADMIN,
]);
