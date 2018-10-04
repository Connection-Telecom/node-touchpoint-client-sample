
/*
 * Example of sending attachments.
 */

'use strict';

const touchpoint = require('touchpoint-client');

const errorHandler = when => err => {
  console.log(`Something went terribly wrong ${when}`, err);
}

const client = touchpoint.createClient();

function sleep() {
  return new Promise(resolve => setTimeout(resolve, 1000));
}

let chatId;

// Please change the customer ID to your own customer before running!
client.createChat({customerId: 'hn5QvbX3btsR2Fsks', topic: 'Attachments example'}).then(_chatId => {
  chatId = _chatId;
  return client.sendMessage('Here is a regular old text message', chatId);
}).then(() => {
  return sleep();
}).then(() => {
  return client.sendMessage('Here is a message with attached link', chatId, {
    type: 'link',
    url: 'https://github.com/Connection-Telecom/node-touchpoint-client',
    title: 'Node Touchpoint client'
  });
}).then(() => {
  return sleep();
}).then(() => {
  return client.sendMessage('Here is a message with attached file', chatId, {
    type: 'file',
    url: 'https://portal.telviva.com/local/content/file.bin',
    filename: 'file.bin'
  });
}).then(() => {
  return sleep();
}).then(() => {
  return client.sendMessage('Here is a message with attached image', chatId, {
    type: 'image',
    url: 'https://portal.telviva.com/local/content/puuung-love-is.jpg'
  });
}).then(() => {
  return sleep();
}).then(() => {
  return client.sendMessage('Here is a message with attached audio', chatId, {
    type: 'audio',
    url: 'http://portal.telviva.com/local/content/Kwaito_Mix_on_BestBeatsTV.mp3'
  });
}).then(() => {
  return sleep();
}).then(() => {
  return client.sendMessage('Here is a message with attached video', chatId, {
    type: 'video',
    url: 'https://portal.telviva.com/local/content/What_I_Do.mp4'
  });
}).then(() => {
  return sleep();
}).then(() => {
  return client.sendMessage('Here is a message with attached location', chatId, {
    type: 'location',
    title: 'Connection Telecom Cape Town office',
    lat: -33.933986,
    long: 18.471258
  });
}).catch(errorHandler('sending messages'));

client.on('chatClosed', chatId => {
  process.exit(0);
});

client.on('error', errorHandler(''));