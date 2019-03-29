const express = require('./express-like')

const app = express()

function test(req, res, next) {
    console.log('haha')
    next()
}

app.get('/api/test', test, (req, res, next) => {
    res.json({
        errno: 0,
        data: 123
    })
})

app.listen(8000, () => {
    console.log('Server running at http://localhost:8000')
})