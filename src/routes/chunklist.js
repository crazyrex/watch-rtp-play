/*
 * Copyright (c) 2018, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

const { Route } = require('serverful')

const Joi = require('joi')
const Boom = require('boom')

const Logger = require('modern-logger')

const Request = require('../rtp-play-request')
const channels = require('../channels.json')

class Chunklist extends Route {
  constructor () {
    super('GET', '/chunklist.m3u8', 'Chunklist', 'Returns a chunklist')
  }

  handler ({ query }, reply) {
    const { channel, bandwidth = 640000, proxy = false } = query

    if (!channels[ channel ]) {
      reply(Boom.badRequest())

      return
    }

    const headers = { 'Referer': `http://www.rtp.pt/play/direto/${channel}` }

    let baseUrl
    let url
    if (channels[ channel ].is_tv) {
      baseUrl = `https://streaming-live.rtp.pt/liverepeater/smil:${channel}.smil`
      url = `${baseUrl}/chunklist_b${bandwidth}_slpt.m3u8`
    } else {
      baseUrl = `http://streaming-live.rtp.pt/liveradio/${channels[ channel ].name}`
      url = `${baseUrl}/chunklist_DVR.m3u8`
    }

    const options = { url, headers, tor: proxy }

    return Request.get(options)
      .then(({ body }) => {
        body = body.replace(/,\n/g, `,\n${baseUrl}/`)

        reply(null, body)
      })
      .catch((error) => {
        Logger.error(error)

        reply(Boom.badImplementation(error))
      })
  }

  validate () {
    return {
      query: {
        channel: Joi.string()
          .required()
          .description('the channel'),
        bandwidth: Joi.number()
          .optional()
          .description('the bandwidth'),
        proxy: Joi.boolean()
          .optional()
          .description('use proxy')
      }
    }
  }

  cors () {
    return {
      origin: [ '*' ]
    }
  }
}

module.exports = new Chunklist()
