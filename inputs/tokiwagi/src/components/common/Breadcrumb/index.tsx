import * as React from "react";

import styles from "./index.module.scss";

export interface Props {
  data: { title: string }[];
}

export default function Breadcrumb({ data }: Props) {
  return (
    <div>
      <ol className={styles.breadcrumb}>
        {data.map(({ title }, index) => (
          <li key={index} className={styles["breadcrumb-item"]}>
            <span>{title}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
