# About
This is an IRC client/bot, its main purpose is to test the [~~experimental~~ master branch of IRC-js](https://github.com/gf3/IRC-js/tree/master).
Most work goes into [IRC-js](https://github.com/gf3/IRC-js/tree/master), and is then used and evaluated here.

## Installation
Clone the repository, run `npm install` in the root folder of the repository.

## Usage
The configuration file, [`config.json`](/nlogax/ircjsbot/blob/master/config-example.json), lets you specify default channels to join, nickname, etc.
The main script, [`bot.js`](/nlogax/ircjsbot/blob/master/bot.js), takes an optional command line argument: the path to the configuration file.
You can then run it like this: `node --harmony bot.js config-dev.json`, or omit the argument and use the [default `config.json`](/nlogax/ircjsbot/blob/master/config-example.json).

There is a plugin API in development and some plugins [over here](https://github.com/nlogax/ircjsbot-plugins).
If you want to use them, run `git submodule update --init` and you should get a `plugin` directory with plugins in it.
Then just add the ones you want to the configuration file.

## Contributing
Things that need work, which would improve [IRC-js](https://github.com/gf3/IRC-js/tree/master) and this project a lot:

* Use the various IRC commands and make sure that the corresponding handlers in IRC-js handle them properly.
* Especially the ones that involve channels and users, so that we have a consistent and correct view of them. 
* Expand upon the mock IRC server, making it more like an actual server. Would make testing a lot nicer.
* Make nice plugins, and fix or report things that suck about the API.

If you like hacking on servers, there's a rudimentary [IRC server](https://github.com/gf3/IRC-js/blob/master/spec/server.js) used for testing.
Making it more like a proper IRC server would improve testing a lot.
Most of the fun stuff happens in [IRC-js](https://github.com/gf3/IRC-js/tree/master), so if you are interested, check that out.

Some Harmony features are used, so pass the `--harmony` V8 option when starting the bot.
