
'use strict';

const readline = require('readline');
const touchpoint = require('touchpoint-client');
const color = require('ansi-color').set;

const rl = readline.createInterface(process.stdin, process.stdout);
let chatCreated = false;

function printMessage(msg) {
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);
  console.log(msg);
  if (chatCreated) {
    rl.prompt(true);
  }
}

function printChatMessage(sender, message) {
  printMessage(color(`[${sender}]`, 'blue') + ' ' + message);
}

const errorHandler = when => err => {
  console.log(`Something went terribly wrong ${when}`, err);
  process.exit(-1);
}

const client = touchpoint.createClient();

client.on('message', (evt, chatId) => {
  if (evt.type === 'agentMsg') {
    printChatMessage(evt.agent, evt.message);
  } else {
    printMessage(color(evt.message, 'yellow'));
  }
});

client.on('chatClosed', chatId => {
  client.close();
  rl.close();
  process.exit(0);
});

client.on('error', errorHandler(''));

// ^C or ^D
rl.on('close', () => {
  client.close();
  process.exit(0);
});

// Please change the customer ID and team to your own customer before running!
client.createChat({customerId: 'hn5QvbX3btsR2Fsks', team: 'default'}).then(chatId => {
  chatCreated = true;
  rl.prompt(true);

  rl.on('line', line => {
    client.sendMessage(line, chatId).catch(errorHandler('while sending a message'));
    readline.moveCursor(process.stdout, 0, -1); // Overwrite the "> blah" prompt line
    printChatMessage('You', line);
  });

  // Send user-is-typing notifications to Touchpoint
  let userLastKeypress = 0; // 0 if not typing, else time of last keypress
  process.stdin.on('keypress', (str, key) => {
    // Ideally we would check if the current line is empty. This is hard to do on the
    // command line, so instead assume the current line is empty if a return or backspace was typed.
    if (key != null && ['return', 'backspace'].indexOf(key.name) > -1) {
      if (userLastKeypress > 0) {
        client.setUserIsTyping(false, chatId).catch(errorHandler('while setting userIsTyping'));
      }
      userLastKeypress = 0;
    } else {
      if (userLastKeypress === 0) {
        client.setUserIsTyping(true, chatId).catch(errorHandler('while setting userIsTyping'));
      }
      userLastKeypress = +(new Date());
    }
  });

  // If the user starts typing a message but then waits for 10 seconds
  // without typing another character, say they aren't typing.
  setInterval(() => {
    const now = +(new Date);
    if (userLastKeypress > 0 && now - userLastKeypress > 10000) {
      userLastKeypress = 0;
      client.setUserIsTyping(false, chatId).catch(errorHandler('while setting userIsTyping'));
    }
  }, 1000);
}).catch(errorHandler('while creating the chat'));

client.on('agentIsTyping', (evt, chatId) => {
  if (evt.agentIsTyping) {
    // Display "agent is typing" notification
  } else {
    // Clear "agent is typing" notification
  }
});
