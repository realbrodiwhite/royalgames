
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAdminData } from '../../adminSlice';
import { Table, Chart } from 'react-table';
import 'react-table/react-table.css';
import 'recharts/recharts.css';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const adminData = useSelector((state) => state.admin.data);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchAdminData()).then(() => setLoading(false));
  }, [dispatch]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="AdminDashboard">
      <h1>Admin Dashboard</h1>
      <Table data={adminData.users} columns={userColumns} />
      <Chart data={adminData.credits} />
    </div>
  );
};

const userColumns = [
  {
    Header: 'Username',
    accessor: 'username',
  },
  {
    Header: 'Email',
    accessor: 'email',
  },
  {
    Header: 'Credits',
    accessor: 'credits',
  },
];

export default AdminDashboard;
