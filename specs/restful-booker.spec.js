const supertest = require('supertest')
const defaults = require('superagent-defaults')
const request = defaults(supertest('https://restful-booker.herokuapp.com'))
const expect = require('chai').expect
const parseXmlString = require('xml2js').parseString
const util = require('../lib/util')

request.set({ // Default headers
  'Accept': 'application/json',
})

describe('restful-booker', () => {
  describe('Ping', () => {
    describe('Healthcheck', () => {
      describe('GET', () => {
        it('responds with a 201 and some text indicating the API is functioning', (done) => {
          request
            .get('/ping')
            .expect(201, 'Created', done)
        })
      })
    })
  })

  describe('Booking', () => {

    let bookingIds
    let bookingToEdit

    describe('GetBookingIds', () => {
      describe('GET', () => {
        describe('All IDs', () => {          
          it('returns 200 and an array of all bookings with their IDs', (done) => {
            request
              .get('/booking')
              .set('Accept', 'application/json')
              .expect(200)
              .expect(util.isJson)
              .expect(util.isArray)
              .end((err, res) => {
                // Store response for later tests
                bookingIds = res.body
                // Check every returned record
                for (let booking of bookingIds) {
                  // Look for a valid bookingid
                  expect(booking.bookingid).to.be.ok
                  // Ensure the booking id is the only property returned
                  expect(Object.keys(booking).length).to.equal(1)
                }
                done(err)
              })
          })          
        })
      })
    })

    describe('GetBooking', () => {
      describe('GET', () => {
        describe('JSON', () => {
          it('returns 200 and details for an existing booking', (done) => {
            let bookingId = bookingIds[0].bookingid
            
            request
              .get(`/booking/${bookingId}`)
              .expect(200)
              .expect(util.isJson)
              .end((err, res) => {
                bookingToEdit = res.body
                expect(res.body.firstname).to.be.a('string')
                expect(res.body.lastname).to.be.a('string')
                expect(res.body.totalprice).to.be.a('number')
                expect(res.body.depositpaid).to.be.a('boolean')
                expect(res.body.bookingdates).to.be.an('object')
                expect(res.body.bookingdates).to.have.property('checkin')
                expect(res.body.bookingdates).to.have.property('checkout')
                if (res.body.additionalneeds) {
                  expect(res.body.additionalneeds).to.be.a('string')
                }
                done(err)
              })
          })
        })
        
        describe('XML', () => {
          it('returns 200 and details for an existing booking', (done) => {
            let bookingId = bookingIds[0].bookingid
            
            request
              .get(`/booking/${bookingId}`)
              .set('Accept', 'application/xml')
              .expect(200)
              .expect(util.isXml)
              .end((err, res) => {
                parseXmlString(res.text, {explicitArray: false}, (parserErr, parsed) => {
                  expect(parsed.booking.firstname).to.be.an('string')
                  expect(parsed.booking.lastname).to.be.an('string')
                  expect(Number.parseInt(parsed.booking.totalprice)).to.be.a('number')
                  expect(parsed.booking.depositpaid).to.be.oneOf(['true', 'false'])
                  expect(parsed.booking.bookingdates).to.be.an('object')
                  expect(parsed.booking.bookingdates).to.have.property('checkin')
                  expect(parsed.booking.bookingdates).to.have.property('checkout')                  
                  if (parsed.booking.additionalneeds) {
                    expect(parsed.booking.additionalneeds).to.be.a('string')
                  }
                })
                done(err)
              })
          })
        })
      })
    })

    describe('GetBookingIds', () => {
      describe('GET', () => {
        describe('Filter by name', () => {
          it('correctly filters by first name', (done) => {
            let filteredBookings
            getFilteredBookings() // Kick things off
            
            // Get bookings filtered by the first name we found earlier
            function getFilteredBookings() { 
              request
                .get(`/booking?firstname=${bookingToEdit.firstname}`)
                .expect(200)
                .expect(util.isJson)
                .expect(util.isArray)
                .end((err, res) => {                  
                  filteredBookings = res.body // Store filtered bookings
                  checkFilteredBookings(err)
                })
            }

            // Check that the returned records have the specified first name
            function checkFilteredBookings(err) {
              if (err) done(err)
              for (let booking of filteredBookings) {
                request
                  .get(`/booking/${booking.bookingid}`)
                  .expect(200)
                  .expect(util.isJson)
                  .end((err, res) => {
                    expect(res.body.firstname).to.equal(bookingToEdit.firstname)
                  })
              }
              done(err)
            }
          })

          it('correctly filters by last name', (done) => {
            let filteredBookings
            getFilteredBookings() // Kick things off
            
            // Get bookings filtered by the last name we found earlier
            function getFilteredBookings() { 
              request
                .get(`/booking?lastname=${bookingToEdit.lastname}`)
                .expect(200)
                .expect(util.isJson)
                .expect(util.isArray)
                .end((err, res) => {
                  filteredBookings = res.body // Store filtered bookings
                  checkFilteredBookings(err) 
                })
            }

            // Check that the returned records have the specified last name
            function checkFilteredBookings(err) {
              if (err) done(err)
              for (let booking of filteredBookings) {
                request
                  .get(`/booking/${booking.bookingid}`)
                  .expect(200)
                  .expect(util.isJson)
                  .end((err, res) => {
                    expect(res.body.lastname).to.equal(bookingToEdit.lastname)
                  })
              }
              done(err)
            }
          })

          it('correctly filters by first and last name', (done) => {
            let filteredBookings
            getFilteredBookings() // Kick things off
            
            // Get bookings filtered by the first and last names we found earlier
            function getFilteredBookings() { 
              request
                .get(`/booking?firstname=${bookingToEdit.firstname}&lastname=${bookingToEdit.lastname}`)
                .expect(200)
                .expect(util.isJson)
                .expect(util.isArray)
                .end((err, res) => {                  
                  filteredBookings = res.body // Store filtered bookings                  
                  checkFilteredBookings(err) 
                })
            }

            // Check that the returned records have the specified first and last names
            function checkFilteredBookings(err) {
              if (err) done(err)
              for (let booking of filteredBookings) {
                request
                  .get(`/booking/${booking.bookingid}`)
                  .expect(200)
                  .expect(util.isJson)
                  .end((err, res) => {
                    expect(res.body.firstname).to.equal(bookingToEdit.firstname)
                    expect(res.body.lastname).to.equal(bookingToEdit.lastname)
                  })
              }
              done(err)
            }
          })
        })

        describe('Filter by date', () => {
          // TODO: Filter by checkin date
          // TODO: Filter by checkout date
          // TODO: Filter by checkin and checkout date
        })
      })
    })
  })
})
