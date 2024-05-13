import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

function UserList() {
  const [users, setUsers] = useState([]);
  const user = useSelector(store => store.userRoot.user);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/${user._id}/users`); // Change the API endpoint accordingly
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const toggleUserStatus = async (userId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/users/${userId}/${newStatus ? 'activate' : 'deactivate'}`); // Change the API endpoint accordingly
      // Update the local state to reflect the updated user status
      setUsers(users.map(user => {
        if (user._id === userId) {
          return { ...user, active: newStatus };
        }
        return user;
      }));
    } catch (error) {
      console.error(`Error ${newStatus ? 'activating' : 'deactivating'} user:`, error);
    }
  };

  const changeUserRole = async (userId, newRole) => {
    try {
      await axios.put(`http://localhost:5000/api/users/${userId}/role`, { role: newRole }); // Change the API endpoint accordingly
      // Update the local state to reflect the updated user role
      setUsers(users.map(user => {
        if (user._id === userId) {
          return { ...user, role: newRole };
        }
        return user;
      }));
    } catch (error) {
      console.error(`Error changing role of user:`, error);
    }
  };

  return (
    <div className="container mt-4">
      <h1>User List</h1>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Active</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.active ? 'Yes' : 'No'}</td>
              <td>{user.role}</td>
              <td>
                <div className="btn-group" role="group">
                  {user.active ? (
                    <button type="button" className="btn btn-danger" onClick={() => toggleUserStatus(user._id, false)}>Deactivate</button>
                  ) : (
                    <button type="button" className="btn btn-success" onClick={() => toggleUserStatus(user._id, true)}>Activate</button>
                  )}
                  <select className="form-select" value={user.role} onChange={(e) => changeUserRole(user._id, e.target.value)}>
                    <option value="Admin">Admin</option>
                    <option value="Instructor">Instructor</option>
                    <option value="Learner">Learner</option>
                  </select>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserList;
