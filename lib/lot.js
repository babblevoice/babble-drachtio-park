

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
     * Parked call by slot number
     * @private
     */
    this._parkedcalls = new Map()

    /**
     * @private
     */
    this._available = []
    for( let i = 1; 100 > i; i++ ) {
      this._available.push( i )
    }

    this._ondestroy = this.__ondestroy.bind( this )
  }


  /**
   * park a call in this lot. If it is linked to another call then it parks other.
   * @param { object } call
   * @returns { object | undefined } the identifier for this parked call ( i.e. "01" ) or undefined on failure
   */
  park( call ) {

    if( 0 === this._available.length ) return

    let other = call.other
    if( other ) {
      if( other.channels.audio ) {
        other.channels.audio.unmix()
        other.channels.audio.play( other.moh )
      }
    } else {
      other = call
    }

    if( call.channels.audio ) call.channels.audio.unmix()

    call.detach()

    const callerid = call.callerid
    
    other.vars.parking = {
      "slot": this._available.shift().toString().padStart( 2, "0" ),
      "count": this._parkedcalls.size + 1,
      "parkedby": { uuid: call.uuid, remote: { user: callerid.user, name: callerid.name } },
      "parked": true
    }

    this._parkedcalls.set( other.vars.parking.slot, other )

    other.on( "call.destroyed", this._ondestroy )
    other.on( "call.pick", this._ondestroy )

    this._options.em.emit( "call.park", other )

    return other
  }

  _returnslot( slot ) {
    this._available.push( parseInt( slot ) )
    this._available.sort( ( a, b ) => { return a - b } )
  }

  /**
   * @private
   */
  __ondestroy( call ) {
    if( call.vars.parking && call.vars.parking.parked ) {
      this.unpark( call.vars.parking.slot )
    }
  }

  /**
   * Unpark the call by slot - or next call if undefined
   * @param { string } slot - the parking lot slot id - if !slot will return the longest waiting parked call
   * @returns { object } the call object or undefined
   * 
   */
  unpark( slot ) {

    if( this._parkedcalls.has( slot ) ) {
      const call = this._parkedcalls.get( slot )
      this._parkedcalls.delete( slot )
      this._returnslot( call.vars.parking.slot )
      call.vars.parking.count = this._parkedcalls.size
      call.vars.parking.parked = false
      call.off( "call.destroyed", this._ondestroy )
      call.off( "call.pick", this._ondestroy )
      this._options.em.emit( "call.unpark", call )
      return call
    }

    if( !slot ) {
      /*
        According to MDN - The keys in Map are ordered in a simple, straightforward way: 
        A Map object iterates entries, keys, and values in the order of entry insertion.
      */
      const key = this._parkedcalls.keys().next().value
      const call = this._parkedcalls.get( key )
      this._parkedcalls.delete( key )
      this._returnslot( call.vars.parking.slot )
      call.vars.parking.count = this._parkedcalls.size
      call.vars.parking.parked = false
      call.off( "call.destroyed", this._ondestroy )
      call.off( "call.pick", this._ondestroy )
      this._options.em.emit( "call.unpark", call )
      return call
    }
  }

  /**
   * Searches currently stored calls by the user who parked the call
   * @param { object } search
   * @param { string } search.parkedby - parked by user id
   * @returns { object }
   */
  find( search ) {
    if( search.parkedby ) {
      for ( const [ , call ] of this._parkedcalls ) {
        const parkedby = call.vars.parking.parkedby
        const parkedbycallerid = parkedby.remote
        if( search.parkedby === parkedbycallerid.user ) {
          return call
        }
      }
    }
  }

  /**
   * 
   * @returns { Array< object > } an array of parked calls
   */
  get() {
    const retval = []
    for ( const [ , call ] of this._parkedcalls ) {
      retval.push( {
        uuid: call.uuid,
        park: call.vars.parking
      } )
    }
    return retval
  }

  /**
   * shortcut
   */
  static create( options ) {
    return new lot( options )
  }
}

module.exports = lot
