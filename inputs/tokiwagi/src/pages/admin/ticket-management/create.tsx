
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { ROLE } from "constants/common";
import AdminLayout from "components/common/AdminLayout";
import CreateOrEditTicketStepper from "components/Ticket/CreateOrEditTicketStepper";
import { Ticket } from "models/Entity";
import { fetchTicketById } from "services/api-client/admin/ticket.service";
import Error from "components/common/Error";
import Spinner from "components/common/Spinner";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { isMasterMonthlyTicket } from "utils/booking";

function CreateTicketPage() {
  const router = useRouter();
  const [errMsg, setErrMsg] = useState<string>();
  const [ticket, setTicket] = useState<Ticket>();
  const [loading, setLoading] = useState<boolean>(false);

  const ticketId = router.query.ticketId;

  useEffect(() => {
    ticketId && fetchData(+ticketId);
  }, [ticketId]);

  const fetchData = async (ticketId: number) => {
    try {
      setErrMsg("");
      setLoading(true);
      const { createdAt, updatedAt, ...ticket } = await fetchTicketById(ticketId);
      delete ticket.TicketDetail.createdAt;
      delete ticket.TicketDetail.updatedAt;

      // remove Master ticket id if any
      delete ticket.masterTicketId;
      if (isMasterMonthlyTicket(ticket)) {
        // Reset supported tenants for master ticket
        ticket.slaveTickets = [];
      }
      setTicket(ticket);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <AdminLayout>
        <section className="p-3 pb-12 font-medium ad-section-container w-full mdonly:w-[740px]">
          {/*Error*/}
          <Error message={errMsg} />

          {!loading && <CreateOrEditTicketStepper ticket={ticket} />}

          {/* Loading */}
          {loading && (
            <div className="flex justify-center mb-12">
              <Spinner />
            </div>
          )}
        </section>
      </AdminLayout>
    </div>
  );
}
export default withAuthentication(CreateTicketPage, [ROLE.SUPER_ADMIN, ROLE.ADMIN]);
