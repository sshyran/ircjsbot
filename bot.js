/** @module bot
 */
 
"use strict";

const fs      = require("fs");
const format  = require("util").format;
const irc     = require("irc-js");
const path    = require("path");

const log   = irc.logger.get("ircjs");
const conf  = require("./" + (path.extname(process.argv[2]) === ".json" ?
                              process.argv[2] : "config.json"));

const PID       = process.pid;
const PID_FILE  = "./bot.pid";

// I'm a monkey and I'm not afraid to patch
const oldReply = irc.Message.prototype.reply;

irc.Message.prototype.reply = function(text) {
  let nick = this.params[1].match(/(?:@\s*([^\s]+)\s*)$/);
  if (nick) {
    nick = nick[1] + ": ";
  } else if (this.params[0] === this.client.user.nick) {
    nick = "";
  } else {
    nick = this.from.nick + ": ";
  }
  arguments[0] = nick + arguments[0];
  return oldReply.apply(this, arguments);
};

// Breaks if nick is changed later...
const cmdRE = "^:(?:[!\\.?`]|" + conf.nick +
  "\\W+)%s(?:\\b%s)(?:\\s+@\\s*[^\\s]+)?";

/** Register a command
 *  @param  {string}    command   Command name, used as trigger
 *  @param  {RegExp}    regexp    Expression to match
 *  @param  {function}  handler   Command handler
 */
irc.Client.prototype.register = function(command, regexp, handler) {
  const re = RegExp(format(cmdRE, command, regexp.source), "i");
  return this.match(re, handler);
};

irc.connect(conf, function(bot) {
  conf.plugins.forEach(function(name) {
    const plugin = require("./plugins/" + name);
    const status = plugin.load(bot);
    if (status === irc.STATUS.SUCCESS) {
      log.info("Plugin %s loaded successfully", plugin.name);
      return;
    }
    log.error("Plugin %s failed to load", plugin.name);
  });

  conf.channels.forEach(function(chan) {
    bot.join(chan);
  });

  fs.writeFileSync(PID_FILE, PID);

  // Remove pid file when exiting
  process.on("exit", function(msg) {
    fs.unlinkSync(PID_FILE);
  });
});

function editDistance(a, b) {
  const la = a.length;
  const lb = b.length;
  const d = new Array(la);

  for (let i = 0; i < la; ++i) {
    d[i] = new Array(lb);
    for (let j = 0; j < lb; ++j) {
      d[i][j] = -1;
    }
  }

  function dist(i, j) {
    if (d[i][j] >= 0) {
      return d[i][j];
    }
    let x;
    if (i === la - 1) {
      x = lb - j - 1;
    } else if (j === lb - 1) {
      x = la - i - 1;
    } else if (a[i] === b[j]) {
      x = dist(i + 1, j + 1);
    } else {
      let y;
      x = dist(i + 1, j + 1);
      if ((y = dist(i, j + 1)) < x) {
        x = y;
      }
      if ((y = dist(i + 1, j)) < x) {
        x = y;
      }
      ++x;
    }
    return d[i][j] = x;
  }
  return dist(0, 0);
}