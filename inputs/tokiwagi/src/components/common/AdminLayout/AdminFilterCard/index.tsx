import React from "react";

import styles from "./index.module.scss";

export default function AdminFilerCard(props: { children: React.ReactNode }) {
  return <div className={styles.adminFilterCard}>{props.children}</div>;
}