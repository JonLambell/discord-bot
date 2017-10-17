import DeleteMessage from './delete-message';

const SendMessage = (originalMessage, data, autoDeleteTime = 0) => {
    const responseMessage = originalMessage.channel.send(data);
    responseMessage.then((message) => {
      if (autoDeleteTime > 0) {
        DeleteMessage(message, autoDeleteTime);
        DeleteMessage(originalMessage, autoDeleteTime);
      }
    });
};

export default SendMessage;
