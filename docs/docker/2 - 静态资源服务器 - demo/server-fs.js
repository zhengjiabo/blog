const http = require('http')
const fsp = require('fs/promises')
const fs = require('fs')
const server = http.createServer(async (req, res) => {
  const stat = await fsp.stat('./index.html')
  // res.setHeader('Content-Length', stat.size)
  fs.createReadStream('./index.html').pipe(res)
})
const port = 8888
server.listen(port, () => {
  console.log(`Listening ${port}`)
})