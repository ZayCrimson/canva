import http from 'node:http'
import handler from './api/gamon.js'

const port = process.env.PORT || 3000

const server = http.createServer(async (req, res) => {
  // Express-like compatibility layer
  res.status = (code) => {
    res.statusCode = code
    return res
  }
  res.json = (data) => {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(data))
  }
  res.send = (data) => {
    res.end(data)
  }

  try {
    await handler(req, res)
  } catch (err) {
    console.error(err)
    if (!res.writableEnded) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ status: false, error: 'Internal server error', code: 500 }))
    }
  }
})

server.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on 0.0.0.0:${port}`)
})
