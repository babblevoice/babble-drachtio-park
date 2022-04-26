
const events = require( "events" )

const expect = require( "chai" ).expect
const park = require( "../../index.js" )


describe( "interface index.js", function() {
  it( `park emit`, async function() {
    let call = {
      "vars": {},
      "channels": { "audio": false },
      "detach": () => {},
      "on": () => {},
      "off": () => {}
    }

    let parklot = park.create()
    let parkcount = 0
    parklot.on( "call.park", ( c ) => {
      parkcount++
    } )

    expect( parklot.park( call, "parkinglot" ).vars.parking.slot ).to.equal( "01" )
    expect( call.vars.parking.slot ).to.equal( "01" )
    expect( parkcount ).to.equal( 1 )

  } )

  it( `park multiple emit`, async function() {
    let call = {
      "vars": {},
      "channels": { "audio": false },
      "detach": () => {},
      "on": () => {},
      "off": () => {}
    }

    let othercall = {
      "vars": {},
      "channels": { "audio": false },
      "detach": () => {},
      "on": () => {},
      "off": () => {}
    }

    let parklot = park.create()
    let parkcount = 0
    parklot.on( "call.park", ( c ) => {
      parkcount++
    } )

    expect( parklot.park( call, "parkinglot" ).vars.parking.slot ).to.equal( "01" )
    expect( call.vars.parking.slot ).to.equal( "01" )

    expect( parklot.park( othercall, "parkinglot" ).vars.parking.slot ).to.equal( "02" )
    expect( othercall.vars.parking.slot ).to.equal( "02" )

    expect( parkcount ).to.equal( 2 )

  } )

  it( `park multiple and unpark`, async function() {
    let call = {
      "vars": {},
      "channels": { "audio": false },
      "detach": () => {},
      "on": () => {},
      "off": () => {}
    }

    let othercall = {
      "vars": {},
      "channels": { "audio": false },
      "detach": () => {},
      "on": () => {},
      "off": () => {}
    }

    let parklot = park.create()
    let parkcount = 0
    parklot.on( "call.park", ( c ) => {
      parkcount++
    } )

    parklot.on( "call.unpark", ( c ) => {
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

  it( `park multiple lots`, async function() {
    let call = {
      "vars": {},
      "channels": { "audio": false },
      "detach": () => {},
      "on": () => {},
      "off": () => {}
    }

    let othercall = {
      "vars": {},
      "channels": { "audio": false },
      "detach": () => {},
      "on": () => {},
      "off": () => {}
    }

    let parklot = park.create()

    expect( parklot.park( call, "domainone.com" ).vars.parking.slot ).to.equal( "01" )
    expect( call.vars.parking.slot ).to.equal( "01" )

    expect( parklot.park( othercall, "domaintwo.com" ).vars.parking.slot ).to.equal( "01" )
    expect( othercall.vars.parking.slot ).to.equal( "01" )
  } )

  it( `park call but it hangs up`, async function() {

    let em = new events.EventEmitter()

    let call = {
      "vars": {},
      "channels": { "audio": false },
      "detach": () => {},
      "on": ( ev, cb ) => { em.on( ev, cb ) },
      "off": () => {}
    }

    let parklot = park.create()

    let parkcount = 0
    parklot.on( "call.park", ( c ) => {
      parkcount++
    } )

    parklot.on( "call.unpark", ( c ) => {
      parkcount--
    } )

    expect( parklot.park( call, "domainone.com" ).vars.parking.slot ).to.equal( "01" )
    expect( call.vars.parking.slot ).to.equal( "01" )

    expect( parkcount ).to.equal( 1 )

    em.emit( "call.destroy", call )

    expect( parkcount ).to.equal( 0 )

  } )

  it( `park call then search by parker`, async function() {
    let call = {
      "vars": {},
      "channels": { "audio": false },
      "detach": () => {},
      "on": ( ev, cb ) => {},
      "off": () => {},
      "remote": { "user": "1000" }
    }

    let anothercall = {
      "vars": {},
      "channels": { "audio": false },
      "detach": () => {},
      "on": ( ev, cb ) => {},
      "off": () => {},
      "remote": { "user": "1001" }
    }

    let parklot = park.create()
    expect( parklot.park( anothercall, "domainone.com" ).vars.parking.slot ).to.equal( "01" )
    expect( parklot.park( call, "domainone.com" ).vars.parking.slot ).to.equal( "02" )

    let foundcall = parklot.find( "domainone.com", { "parkedby": "1000" } )

    expect( foundcall.remote.user ).to.equal( "1000" )
    expect( foundcall.vars.parking.slot ).to.equal( "02" )

    foundcall = parklot.find( "domainone.com", { "parkedby": "1002" } )
    expect( foundcall ).to.be.undefined
  } )
} )