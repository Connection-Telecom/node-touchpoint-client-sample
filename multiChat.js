
/*
 * Example of driving multiple chats from a single client instance.
 * Type "create <topic>" in one of the chats to create a new chat, "close"
 * to close that chat or any other message to have it echoed back to you.
 */

'use strict';

const touchpoint = require('touchpoint-client');

const errorHandler = when => err => {
  console.log(`Something went terribly wrong ${when}`, err);
}

const client = touchpoint.createClient();

client.on('message', (evt, chatId) => {
  if (evt.type === 'agentMsg') {
    if (evt.message === 'close') {
      client.closeChat(chatId);
    } else if (/^create /.test(evt.message)) {
      createChat(evt.message.replace(/^create /, ''));
    } else {
      client.sendMessage(`You said: ${evt.message}`, chatId)
        .catch(errorHandler('while sending a message'));
    }
  }
});

client.on('chatClosed', chatId => {
  console.log('Chat closed by agent:', chatId)
});

client.on('error', errorHandler(''));

function createChat(topic) {
  // Please change the customer ID to your own customer before running!
  client.createChat({customerId: 'hn5QvbX3btsR2Fsks', topic: topic})
    .catch(errorHandler('while creating a chat'));
}

createChat('Starter');