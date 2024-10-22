import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import fetchAdminData from '../../store/adminSlice';
import { useTable } from 'react-table';
import 'react-table/react-table.css';
import 'recharts/recharts.css';
import Chart from '../chart/chart';

interface User {
  username: string;
  email: string;
  credits: number;
}

interface AdminData {
  users: User[];
  credits: Array<{ name: string; value: number }>;
}

interface RootState {
  admin: {
    data: AdminData;
  };
}

// Define a custom Column interface
interface Column<T> {
  Header: string;
  accessor: keyof T; // Use keyof to restrict to properties of T
}

// Define the userColumns with the new Column interface
const userColumns: Column<User>[] = [
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

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const adminData = useSelector((state: RootState) => state.admin.data);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(fetchAdminData());
      setLoading(false);
    };

    fetchData();
  }, [dispatch]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="admin">
      <h1>Admin Dashboard</h1>
      <Table data={adminData.users} columns={userColumns} />
      <Chart data={adminData.credits} />
    </div>
  );
};

// Table component using react-table
const Table: React.FC<{ data: User[]; columns: Column<User>[] }> = ({ data, columns }) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data });

  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()} key={column.id}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()} key={row.id}>
              {row.cells.map((cell) => (
                <td {...cell.getCellProps()} key={cell.column.id}>{cell.render('Cell')}</td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default AdminDashboard;