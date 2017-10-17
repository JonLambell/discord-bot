const DeleteMessage = (message, time, debug = false) => {
    message.delete(time * 1000).catch((error) => {
      if (debug) {
        message.channel.send(`I can't delete a message: ${error}`);
      }
    });
};

export default DeleteMessage;
