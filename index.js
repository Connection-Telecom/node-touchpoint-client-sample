
'use strict';

const readline = require('readline');
const touchpoint = require('touchpoint-client');
const color = require('ansi-color').set;

const rl = readline.createInterface(process.stdin, process.stdout);
let ready = false;

function printMessage(msg) {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  console.log(msg);
  if (ready) {
    rl.prompt(true);
  }
}

function printChatMessage(sender, message) {
  printMessage(color(`[${sender}]`, 'blue') + ' ' + message);
}

// Please change the customer ID and team to your own customer before running!
const chat = touchpoint.createChat({customerId: 'tDNRFKYYtyrAnhais', team: 'Spinners'});

chat.on('message', evt => {
  if (evt.type === 'agentMsg') {
    printChatMessage(evt.agent, evt.message);
  } else {
    printMessage(color(evt.message, 'yellow'));
  }
});

chat.on('ready', () => {
  ready = true;
  isReady();
});

chat.on('closed', () => {
  rl.close();
  process.exit(0);
});

chat.on('error', err => {
  printMessage('Something went terribly wrong', err);
  process.exit(-1);
});

// ^C or ^D
rl.on('close', () => {
  chat.close();
  process.exit(0);
});

function isReady() {
  rl.prompt(true);
  rl.on('line', line => {
    chat.sendMessage(line);
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
        chat.setUserIsTyping(false);
      }
      userLastKeypress = 0;
    } else {
      if (userLastKeypress === 0) {
        chat.setUserIsTyping(true);
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
      chat.setUserIsTyping(false);
    }
  }, 1000);
}

chat.on('agentIsTyping', evt => {
  if (evt.agentIsTyping) {
    // Display "agent is typing" notification
  } else {
    // Clear "agent is typing" notification
  }
});
