const DeleteMessage = (message, time) => {
    message.delete(time * 1000).catch((error) => {
      if (config.debuginchat) {
        message.channel.send(`I can't delete a message: ${error}`);
      }
    });
};

export default DeleteMessage;
