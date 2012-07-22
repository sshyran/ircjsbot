const path    = require( "path" )
    , irc     = require( "irc-js" )

const Client  = irc.Client
    , conf    = path.join( __dirname, process.argv[ 2 ] || "config.json" )
    , log     = irc.logger.get( "ircjs" )
    // We'll look here, in addition to Node's existing paths, for modules
    , plugDir = path.join( __dirname, "plugins" )

// I'll just let this live here until I know where they should be.
const plugins = {}

/** Since we don't have interfaces or equivalent, the imaginary Plugin interface is described here.
    Each plugin is a module, exporting itself as the module object. It may use submodules internally.

    This object should conform to the following interface:

      @property {string}                        name
        Human-readable plugin name. If not present, the module name is used.
        Currently only used when publically shaming buggy plugins.

      @property {function(Client):irc.STATUS}   load
        Perform required initialization work, if any.
        Return an irc.STATUS saying how it went.

      @property {function(Client):irc.STATUS}   unload
        Perform cleanup work if any, e.g. disconnect from DB, close file handles, etc.
        Return an appropriate irc.STATUS.
 */

const main = function main() {
  const client = new Client( conf )

  client.connect( function( srv ) {
    client.config.channels.forEach( function( cn ) {
      client.join( cn )
    } )
  } )

  client.listen( irc.EVENT.DISCONNECT, function( msg ) {
    var k
    for ( k in plugins )
      if ( plugins.hasOwnProperty( k ) ) {
        plugins[ k ].unload()
        delete plugins[ k ]
      }
    log.info( "Shutting down" )
    process.exit()  // @todo wait for plugins to signal?
  } )

  /** Load plugins, if any
   *  I want to add `plugDir' to Node's module paths, tried many different ways
   *  but it seems module.js has decided on an array of paths before there's a
   *  chance to do anything about it, and it's not exported.
   *  Hardcoding it to look *only* there instead, for the time being.
   */
  if ( client.config[ "plugins" ] )
    client.config[ "plugins" ].forEach( function( plugName ) {
      const plugin = require( path.join( plugDir, plugName ) )
          , status = plugin.load( client )
      if ( irc.STATUS.SUCCESS ) {
        log.debug( "Plugin %s loaded successfully", plugin.name )
        plugins[ plugin.name ] = plugin
      } else
        log.debug( "Plugin %s failed to load", plugin.name )
    } )
  plugins[ "Core" ] = require( "./core" )
  plugins[ "Core" ].load( client )
}

// Are we main? Then run bot.
if ( ! module.parent ) {
  log.info( "Starting bot" )
  main()
}

// For REPL fiddling.
exports.main    = main
exports.plugins = plugins
