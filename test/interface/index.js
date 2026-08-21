
const events = require( "events" )

const expect = require( "chai" ).expect
const park = require( "../../index.js" )


describe( "interface index.js", function() {
  it( "park emit", async function() {
    const call = {
      "vars": {},
      "channels": { "audio": false },
      "detach": () => {},
      "on": () => {},
      "off": () => {},
      "remote": { "user": "", "name": ""},
      "direction": "inbound",
      "callerid": { "user": "", "name": "" },
      "calledid": { "user": "0000000000", "name": "" }
    }

    const parklot = park.create()
    let parkcount = 0
    parklot.on( "call.park", (  ) => {
      parkcount++
    } )

    expect( parklot.park( call, "parkinglot" ).vars.parking.slot ).to.equal( "01" )
    expect( call.vars.parking.slot ).to.equal( "01" )
    expect( parkcount ).to.equal( 1 )

  } )

  it( "park multiple emit", async function() {
    const call = {
      "vars": {},
      "channels": { "audio": false },
      "detach": () => {},
      "on": () => {},
      "off": () => {},
      "remote": { "user": "", "name": ""},
      "direction": "inbound",
      "callerid": { "user": "", "name": "" },
      "calledid": { "user": "0000000000", "name": "" }
    }

    const othercall = {
      "vars": {},
      "channels": { "audio": false },
      "detach": () => {},
      "on": () => {},
      "off": () => {},
      "remote": { "user": "", "name": ""},
      "direction": "inbound",
      "callerid": { "user": "", "name": "" },
      "calledid": { "user": "0000000000", "name": "" }
    }

    const parklot = park.create()
    let parkcount = 0
    parklot.on( "call.park", (  ) => {
      parkcount++
    } )

    expect( parklot.park( call, "parkinglot" ).vars.parking.slot ).to.equal( "01" )
    expect( call.vars.parking.slot ).to.equal( "01" )

    expect( parklot.park( othercall, "parkinglot" ).vars.parking.slot ).to.equal( "02" )
    expect( othercall.vars.parking.slot ).to.equal( "02" )

    expect( parkcount ).to.equal( 2 )

  } )

  it( "park multiple and unpark", async function() {
    const call = {
      "vars": {},
      "channels": { "audio": false },
      "detach": () => {},
      "on": () => {},
      "off": () => {},
      "remote": { "user": "", "name": ""},
      "direction": "inbound",
      "callerid": { "user": "", "name": "" },
      "calledid": { "user": "0000000000", "name": "" }
    }

    const othercall = {
      "vars": {},
      "channels": { "audio": false },
      "detach": () => {},
      "on": () => {},
      "off": () => {},
      "remote": { "user": "", "name": ""},
      "direction": "inbound",
      "callerid": { "user": "", "name": "" },
      "calledid": { "user": "0000000000", "name": "" }
    }

    const parklot = park.create()
    let parkcount = 0
    parklot.on( "call.park", (  ) => {
      parkcount++
    } )

    parklot.on( "call.unpark", (  ) => {
      parkcount--
    } )

    expect( parklot.park( call, "parkinglot" ).vars.parking.slot ).to.equal( "01" )
    expect( call.vars.parking.slot ).to.equal( "01" )

    expect( parklot.park( othercall, "parkinglot" ).vars.parking.slot ).to.equal( "02" )
    expect( othercall.vars.parking.slot ).to.equal( "02" )

    expect( parkcount ).to.equal( 2 )

    expect( parklot.unpark( "parkinglot" ).vars.parking.slot ).to.equal( "01" )
    expect( parklot.unpark( "parkinglot" ).vars.parking.slot ).to.equal( "02" )

    expect( parkcount ).to.equal( 0 )

    expect( parklot.park( call, "parkinglot" ).vars.parking.slot ).to.equal( "01" )
    expect( parklot.park( call, "parkinglot" ).vars.parking.slot ).to.equal( "02" )
    expect( call.vars.parking.slot ).to.equal( "02" )
    expect( parklot.unpark( "parkinglot", "02" ).vars.parking.slot ).to.equal( "02" )

  } )

  it( "park multiple lots", async function() {
    const call = {
      "vars": {},
      "channels": { "audio": false },
      "detach": () => {},
      "on": () => {},
      "off": () => {},
      "remote": { "user": "", "name": ""},
      "direction": "inbound",
      "callerid": { "user": "", "name": "" },
      "calledid": { "user": "0000000000", "name": "" }
    }

    const othercall = {
      "vars": {},
      "channels": { "audio": false },
      "detach": () => {},
      "on": () => {},
      "off": () => {},
      "remote": { "user": "", "name": ""},
      "direction": "inbound",
      "callerid": { "user": "", "name": "" },
      "calledid": { "user": "0000000000", "name": "" }
    }

    const parklot = park.create()

    expect( parklot.park( call, "domainone.com" ).vars.parking.slot ).to.equal( "01" )
    expect( call.vars.parking.slot ).to.equal( "01" )

    expect( parklot.park( othercall, "domaintwo.com" ).vars.parking.slot ).to.equal( "01" )
    expect( othercall.vars.parking.slot ).to.equal( "01" )
  } )

  it( "park call but it hangs up", async function() {

    const em = new events.EventEmitter()

    const call = {
      "vars": {},
      "channels": { "audio": false },
      "detach": () => {},
      "on": ( ev, cb ) => { em.on( ev, cb ) },
      "off": () => {},
      "remote": { "user": "", "name": ""},
      "direction": "inbound",
      "callerid": { "user": "", "name": "" },
      "calledid": { "user": "0000000000", "name": "" }
    }

    const parklot = park.create()

    let parkcount = 0
    parklot.on( "call.park", (  ) => {
      parkcount++
    } )

    parklot.on( "call.unpark", (  ) => {
      parkcount--
    } )

    expect( parklot.park( call, "domainone.com" ).vars.parking.slot ).to.equal( "01" )
    expect( call.vars.parking.slot ).to.equal( "01" )

    expect( parkcount ).to.equal( 1 )

    em.emit( "call.destroyed", call )

    expect( parkcount ).to.equal( 0 )

  } )

  it( "park call then search by parker", async function() {
    const call = {
      "vars": {},
      "channels": { "audio": false },
      "detach": () => {},
      "on": ( /*ev, cb*/ ) => {},
      "off": () => {},
      "remote": { "user": "1000", "name": ""},
      "direction": "inbound",
      "callerid": { "user": "1000", "name": "" },
      "calledid": { "user": "0000000000", "name": "" }
    }

    const anothercall = {
      "vars": {},
      "channels": { "audio": false },
      "detach": () => {},
      "on": ( /*ev, cb*/ ) => {},
      "off": () => {},
      "remote": { "user": "1001", "name": ""},
      "direction": "inbound",
      "callerid": { "user": "1001", "name": "" },
      "calledid": { "user": "0000000000", "name": "" }
    }

    const parklot = park.create()
    expect( parklot.park( anothercall, "domainone.com" ).vars.parking.slot ).to.equal( "01" )
    expect( parklot.park( call, "domainone.com" ).vars.parking.slot ).to.equal( "02" )

    let foundcall = parklot.find( "domainone.com", { "parkedby": "1000" } )

    expect( foundcall.remote.user ).to.equal( "1000" )
    expect( foundcall.vars.parking.slot ).to.equal( "02" )

    foundcall = parklot.find( "domainone.com", { "parkedby": "1002" } )
    expect( foundcall ).to.be.undefined
  } )

  /*
    SIP-99 / SIP-190: parkedby must name the device that parked, and the device
    is the far end of the leg the park arrives on. Which id that is depends on
    how the leg was set up - the softphone's leg is a uas when the agent dialled
    out (so the device is the callerid) but a uac when we rang the device for an
    inbound call, and there callmanager resolves callerid to the *caller* via
    #calleridother. Reading callerid unconditionally therefore records the
    outside caller as the parker on every inbound park, which is why "answer the
    last call I parked" silently finds nothing (find() matches on that field).
  */
  it( "park an inbound call - parkedby is the device, not the caller", async function() {

    const parkedleg = {
      "vars": {},
      "channels": { "audio": false },
      "detach": () => {},
      "on": ( /*ev, cb*/ ) => {},
      "off": () => {}
    }

    /* we rang the device for an inbound call, so this leg is a uac */
    const parkingleg = {
      "uuid": "parking-leg",
      "vars": {},
      "channels": { "audio": false },
      "detach": () => {},
      "on": ( /*ev, cb*/ ) => {},
      "off": () => {},
      "other": parkedleg,
      "direction": "outbound",
      "callerid": { "user": "07700900123", "name": "Kermit the Frog" },
      "calledid": { "user": "1000", "name": "Nurse Hannah" }
    }

    const parklot = park.create()
    parklot.park( parkingleg, "domainone.com" )

    expect( parkedleg.vars.parking.parkedby.remote.user ).to.equal( "1000" )
    expect( parkedleg.vars.parking.parkedby.remote.name ).to.equal( "Nurse Hannah" )

    /* and so the agent can pick their own call back up */
    const found = parklot.find( "domainone.com", { "parkedby": "1000" } )
    expect( found ).to.equal( parkedleg )
  } )

  it( "park an outbound call - parkedby is still the device", async function() {

    const parkedleg = {
      "vars": {},
      "channels": { "audio": false },
      "detach": () => {},
      "on": ( /*ev, cb*/ ) => {},
      "off": () => {}
    }

    /* the agent dialled out, so their leg came to us as a uas */
    const parkingleg = {
      "uuid": "parking-leg",
      "vars": {},
      "channels": { "audio": false },
      "detach": () => {},
      "on": ( /*ev, cb*/ ) => {},
      "off": () => {},
      "other": parkedleg,
      "direction": "inbound",
      "callerid": { "user": "1000", "name": "Nurse Hannah" },
      "calledid": { "user": "07700900123", "name": "Kermit the Frog" }
    }

    const parklot = park.create()
    parklot.park( parkingleg, "domainone.com" )

    expect( parkedleg.vars.parking.parkedby.remote.user ).to.equal( "1000" )

    const found = parklot.find( "domainone.com", { "parkedby": "1000" } )
    expect( found ).to.equal( parkedleg )
  } )
} )
