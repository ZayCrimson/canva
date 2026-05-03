import express from 'express'
import gamon from './api/gamon.js'
import stress from './api/stress.js'

const app = express()
const port = process.env.PORT || 3000

// =========================
// ROUTES
// =========================
app.get('/', (req, res) => {
    res.send('API jalan')
})

app.get('/api/gamon', gamon)
app.get('/api/stress', stress)

// =========================
// 404 HANDLER
// =========================
app.use((req, res) => {
    res.status(404).json({
        status: false,
        error: 'Endpoint tidak ditemukan'
    })
})

// =========================
// ERROR HANDLER
// =========================
app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).json({
        status: false,
        error: 'Internal server error'
    })
})

app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on 0.0.0.0:${port}`)
})
