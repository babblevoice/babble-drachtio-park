
const expect = require( "chai" ).expect
const events = require( "events" )
const park = require( "../../index.js" )


describe( "interface index.js", function() {
  it( `park emit`, async function() {
    let call = {
      "vars": {}
    }

    let parklot = park.create()
    let parkcount = 0
    parklot.on( "call.park", ( c ) => {
      parkcount++
    } )


    expect( parklot.park( call, "parkinglot" ) ).to.equal( "01" )
    expect( call.vars.parking ).to.equal( "01" )
    expect( parkcount ).to.equal( 1 )

  } )

  it( `park multiple emit`, async function() {
    let call = {
      "vars": {}
    }

    let othercall = {
      "vars": {}
    }

    let parklot = park.create()
    let parkcount = 0
    parklot.on( "call.park", ( c ) => {
      parkcount++
    } )


    expect( parklot.park( call, "parkinglot" ) ).to.equal( "01" )
    expect( call.vars.parking ).to.equal( "01" )

    expect( parklot.park( othercall, "parkinglot" ) ).to.equal( "02" )
    expect( othercall.vars.parking ).to.equal( "02" )

    expect( parkcount ).to.equal( 2 )

  } )

  it( `park multiple and unpark`, async function() {
    let call = {
      "vars": {}
    }

    let othercall = {
      "vars": {}
    }

    let parklot = park.create()
    let parkcount = 0
    parklot.on( "call.park", ( c ) => {
      parkcount++
    } )

    parklot.on( "call.unpark", ( c ) => {
      parkcount--
    } )


    expect( parklot.park( call, "parkinglot" ) ).to.equal( "01" )
    expect( call.vars.parking ).to.equal( "01" )

    expect( parklot.park( othercall, "parkinglot" ) ).to.equal( "02" )
    expect( othercall.vars.parking ).to.equal( "02" )

    expect( parkcount ).to.equal( 2 )

    expect( parklot.unpark( "parkinglot" ).vars.parking ).to.equal( "01" )
    expect( parklot.unpark( "parkinglot" ).vars.parking ).to.equal( "02" )

    expect( parkcount ).to.equal( 0 )

    expect( parklot.park( call, "parkinglot" ) ).to.equal( "01" )
    expect( parklot.park( call, "parkinglot" ) ).to.equal( "02" )
    expect( call.vars.parking ).to.equal( "02" )
    expect( parklot.unpark( "parkinglot", "02" ).vars.parking ).to.equal( "02" )

  } )

  it( `park multiple lots`, async function() {
    let call = {
      "vars": {}
    }

    let othercall = {
      "vars": {}
    }

    let parklot = park.create()
    let parkcount = 0
    parklot.on( "call.park", ( c ) => {
      parkcount++
    } )

    parklot.on( "call.unpark", ( c ) => {
      parkcount--
    } )

    expect( parklot.park( call, "domainone.com" ) ).to.equal( "01" )
    expect( call.vars.parking ).to.equal( "01" )

    expect( parklot.park( othercall, "domaintwo.com" ) ).to.equal( "01" )
    expect( othercall.vars.parking ).to.equal( "01" )
  } )
} )