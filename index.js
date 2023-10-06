
const events = require( "events" )
const parkinglot = require( "./lib/lot.js" )

/**
Manage all of our fifos (queues), calls queueing and agents.
*/
class park {

  /**
  @param { object } options
  @param { object } [ options.em ] - event emmitter
  */
  constructor( options ) {

    if( !options ) options = {}

    /**
    @private
    */
    this._options = options

    if( !this._options.em ) {
      this._options.em = new events.EventEmitter()
    }

    /**
    @private
    */
    this._lots = new Map()

    /**
     * Add the ability to park a call via an event.
     */
    this._options.em.on( "park.call", this._park.bind( this ) )
  }

  /**
   * Shortcut to create a park.
   */
  static create( options ) {
    return new park( options )
  }

  /**
   * @param { object } obj
   * @param { string } obj.lot - the lot to park the call in
   * @param { object } obj.call - the call object
   */
  _park( obj ) {
    this.park( obj.call, obj.lot )
  }

  /**
   * Park a call in a lot
   * @param { object } call
   * @param { string } lot
   * @returns { object } the parked leg with the vars.parking object set
   */
  park( call, lot ) {
    if( this._lots.has( lot ) ) {
      return this._lots.get( lot ).park( call )
    }

    const ourlot = parkinglot.create( this._options )
    this._lots.set( lot, ourlot )
    return ourlot.park( call )
  }

  /**
   * Pop a call from a parking lot
   * @param { string } id - the id or undefined (undefined = the longest waiting)
   * @returns { object } the call object
   */
  unpark( lot, id ) {
    if( this._lots.has( lot ) ) {
      return this._lots.get( lot ).unpark( id )
    }
  }

  /**
   * 
   * @param { string } lot 
   * @param { object } search - lot.find
   * @returns { object } (call)
   */
  find( lot, search ) {
    if( this._lots.has( lot ) ) {
      return this._lots.get( lot ).find( search )
    }
  }

  /**
   * 
   * @param { string } lot 
   * @returns { Array< object > } an array of parked calls
   */
  get( lot ) {
    if( this._lots.has( lot ) ) {
      return this._lots.get( lot ).get()
    }
    return []
  }

  /**
   * Wrapper for our event emitter
   * @param { object } ev 
   * @param { function } cb 
   */
  on( ev, cb ) {
    this._options.em.on( ev, cb )
  }
}


module.exports = park
