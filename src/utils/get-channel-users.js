const GetChannelUsers = (channel) => {
    const UserList = [];
    try {
      channel.members.forEach(member => {
        UserList.push(member.user.toString());
      });

      return UserList;
    } catch(e) {
      throw new Error('Can\'t find channel');
    }
};

export default GetChannelUsers;
