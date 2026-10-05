import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import UserList from './pages/UserList';
import UserDetail from './pages/UserDetail';
import OrderList from './pages/OrderList';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/users" element={<UserList />}>
        <Route path=":id" element={<UserDetail />} />
      </Route>
      <Route path="/orders" element={<OrderList />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
