import users from './data/Users.json';
import roles from './data/Roles.json';

export const getUserWithRole = (userEmail:string) => {
    
        const user = users.find(u => u.email === userEmail);
        if (!user) return null;
        const role = roles.find(r => r.id === user.roleId);
        return {
            ...user,
            roleName: role ? role.name : 'Unknown Role'
        };
};