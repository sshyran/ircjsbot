/** @module bot
 */
 
"use strict";

const irc   = require("irc-js");
const fs    = require("fs");
const path  = require("path");

const log   = irc.logger.get("ircjs");
const conf  = require("./" + (path.extname(process.argv[2]) === ".json" ?
                              process.argv[2] : "config.json"));

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

  bot.join(conf.channels.join(","));
});
