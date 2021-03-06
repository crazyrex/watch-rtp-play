/*
 * Copyright (c) 2017, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

describe('RTP Play Request', () => {
  let subject
  let Request
  let Health

  before(() => {
    Request = td.constructor([])

    Health = td.object([ 'addCheck' ])
  })

  afterEach(() => td.reset())

  describe('when exporting', () => {
    beforeEach(() => {
      td.replace('request-on-steroids', Request)

      subject = require('../src/rtp-play-request')
    })

    it('should be instance of request-on-steroids', () => {
      subject.should.be.instanceOf(Request)
    })
  })

  describe('when exporting and loading request-on-steroids', () => {
    beforeEach(() => {
      td.replace('health-checkup', Health)

      subject = require('../src/rtp-play-request')
    })

    it('should create a request-on-steroids with post function', () => {
      subject.should.have.property('post')
      subject.post.should.be.instanceOf(Function)
    })

    it('should create a request-on-steroids with circuitBreaker function', () => {
      subject.should.have.property('circuitBreaker')
      subject.post.should.be.instanceOf(Function)
    })
  })

  describe('when constructing', () => {
    beforeEach(() => {
      td.replace('request-on-steroids', Request)

      td.replace('health-checkup', Health)

      subject = require('../src/rtp-play-request')
    })

    it('should construct request instance with default options', () => {
      const captor = td.matchers.captor()

      td.verify(new Request(captor.capture()), { times: 1 })

      const options = captor.value
      options.should.have.nested.property('perseverance.retry.max_tries', 2)
    })

    it('should add rtp play health check', () => {
      td.verify(Health.addCheck('rtp-play', td.matchers.isA(Function)), { times: 1 })
    })
  })
})
