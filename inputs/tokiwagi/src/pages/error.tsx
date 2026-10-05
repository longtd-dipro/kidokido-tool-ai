import Layout from "components/common/Layout";
import { ERROR_MESSAGES } from "constants/errors";

type ErrorPageProps = {
  message?: string
}

export default function ErrorPage({ message }: ErrorPageProps) {
  return (
    <Layout>
      <section className="relative text-gray-600 body-font">
        <div className="container flex justify-center px-5 py-24 mx-auto text-red-color">
          {message || ERROR_MESSAGES.SOMETHING_WENT_WRONG}
        </div>
      </section>
    </Layout>
  );
}
