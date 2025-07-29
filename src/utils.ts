// utils.ts
import roles from './../mockServer/data/Roles.json';

export const getUserWithRole = async (userEmail: string) => {
  try {
    const res = await fetch('http://localhost:8000/Users'); // Replace with your API URL
    const users = await res.json();

    const user = users.find((u: any) => u.email === userEmail);
    if (!user) return null;

    const role = roles.find(r => r.id === user.roleId);
    return {
      ...user,
      roleName: role ? role.name : 'Unknown Role'
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return null;
  }
};
