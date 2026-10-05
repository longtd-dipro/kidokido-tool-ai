import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { ROLE } from "constants/common";
import { ERROR_MESSAGES } from "constants/errors";
import AdminLayout from "components/common/AdminLayout";
import Error from "components/common/Error";
import Spinner from "components/common/Spinner";
import CreateOrEditTicketStepper from "components/Ticket/CreateOrEditTicketStepper";
import { Ticket } from "models/Entity";
import { fetchTicketById } from "services/api-client/admin/ticket.service";
import { withAuthentication } from "libs/hoc/withAuthentication";

function EditTicketPage() {
  const router = useRouter();
  const [errMsg, setErrMsg] = useState<string>();
  const [ticket, setTicket] = useState<Ticket>();
  const [loading, setLoading] = useState<boolean>(false);

  const { ticketId } = router.query;

  useEffect(() => {
    ticketId && fetchData(+ticketId);
  }, [ticketId]);

  const fetchData = async (ticketId: number) => {
    try {
      setErrMsg("");
      setLoading(true);
      const ticket = await fetchTicketById(ticketId, {
        includeSlaveTickets: true,
        includeHasBooking: true
      });
      setTicket(ticket);
      if (!ticket) {
        setErrMsg(ERROR_MESSAGES.NOT_FOUND);
      }
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <section className="ad-section-container p-3 pb-12">
        {/*Error*/}
        <Error message={errMsg} />

        {!loading && ticket && <CreateOrEditTicketStepper ticket={ticket} isCreateMode={false} />}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center mb-12">
            <Spinner />
          </div>
        )}
      </section>
    </AdminLayout>
  );
}
export default withAuthentication(EditTicketPage, [ROLE.SUPER_ADMIN, ROLE.ADMIN]);
