import DeleteMessage from './delete-message';

const SendMessage = (originalMessage, data, autoDeleteTime, debug = false) => {
    const responseMessage = originalMessage.channel.send(data);
    responseMessage.then((message) => {
      if (autoDeleteTime > 0) {
        DeleteMessage(message, autoDeleteTime, debug);
        DeleteMessage(originalMessage, autoDeleteTime, debug);
      }
    });
};

export default SendMessage;
