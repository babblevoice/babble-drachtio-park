

/**
 * A parking lot
 */
class lot {

  /**
   * Contrsuct our lot
   * @param { object } options
   * @param { object } options.em - our event emitter
   */
  constructor( options ) {

    /**
     * @private
     */
    this._options = options

    /**
     * @private
     */
    this._parkedcalls = new Map()

    /**
     * @private
     */
    this._available = []
    for( let i = 1; i < 99; i++ ) {
      this._available.push( i )
    }
  }


  /**
   * park a call in this lot
   * @returns { string } the identifier for this parked call ( i.e. "01" ) or undefined on failure
   */
  park( call ) {

    if( 0 === this._available.length ) return
    
    call.vars.parking = this._available.shift().toString().padStart( 2, "0" )

    this._parkedcalls.set( call.vars.parking, call )

    this._options.em.emit( "call.park", call )

    return call.vars.parking
  }

  /**
   * Unpark the call by id - or next call if undefined
   * @param { string } - the parking lot id - if id will return the longest waiting parked call
   * @returns { call } the call object or undefined
   * 
   */
  unpark( id ) {

    if( this._parkedcalls.has( id ) ) {
      let call = this._parkedcalls.get( id )
      this._parkedcalls.delete( id )
      this._available.push( parseInt( call.vars.parking ) )
      this._available.sort( ( a, b ) => { return a - b } )
      this._options.em.emit( "call.unpark", call )
      return call
    }

    if( !id ) {
      /*
        Accoring to MDN - The keys in Map are ordered in a simple, straightforward way: 
        A Map object iterates entries, keys, and values in the order of entry insertion.
      */
      let key = this._parkedcalls.keys().next().value
      let call = this._parkedcalls.get( key )
      this._parkedcalls.delete( key )
      this._available.push( parseInt( call.vars.parking ) )
      this._available.sort( ( a, b ) => { return a - b } )
      this._options.em.emit( "call.unpark", call )
      return call
    }
  }

  /**
   * shortcut
   */
  static create( options ) {
    return new lot( options )
  }
}

module.exports = lot
