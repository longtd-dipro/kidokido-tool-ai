import { useEffect, useState } from 'react';
const API_BASE = process.env.REACT_APP_API;
export default function OrderList() {
  const [rows, setRows] = useState([]);
  useEffect(() => { fetch('/api/orders').then((r) => r.json()).then(setRows); }, []);
  const ship = (id) => fetch(`${API_BASE}/api/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status: 'SHIPPED' }) });
  const m = new Map(); m.get('/not-a-call');
  return <table>{rows.map((o) => <tr key={o.id} onClick={() => ship(o.id)}><td>{o.id}</td></tr>)}</table>;
}
