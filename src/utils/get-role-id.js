const GetRoleID = (guild, roleName) => {
    const role = guild.roles.find("name", roleName);

    if (role) {
      return role.id;
    } else {
      return false;
    }
};

export default GetRoleID;
