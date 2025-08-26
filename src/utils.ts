// utils.ts
import roles from './../mockServer/MockData.json'

export const getUserWithRole = async (userEmail: string) => {
  try {
    const res = await fetch('http://localhost:8000/users'); // Replace with your API URL
    const users = await res.json();

    const user = users.find((u: any) => u.email === userEmail);
    if (!user) return null;

    // If user already has roleName, use it; otherwise look it up
    let roleName = user.roleName;
    if (!roleName) {
      const role = roles.Roles.find(r => r.id === user.roleId);
      roleName = role ? role.name : 'Unknown Role';
    }

    return {
      ...user,
      roleName: roleName
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return null;
  }
};
