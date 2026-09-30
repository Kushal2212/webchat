import http from "node:http"
import { WebSocketServer } from "ws"
import fs from "node:fs/promises"
import path from "path"

const PORT = process.env.PORT || 9000

const httpServer = http.createServer(async function (req, res){
    const file = await fs.readFile(path.resolve('./index.html'),'utf-8')
    res.setHeader('content-type', 'text/html')
    return res.end(file)
})
const wsServer = new WebSocketServer({server: httpServer})


wsServer.on("connection", (websocket)=>{
    console.log("Websocket connection...")

    websocket.on('message', (data)=>{
        console.log(`Websocket Message recive:`, data.toString())
        websocket.send("Hello ji what is this ")
    })
})







httpServer.listen(PORT, ()=>{
    console.log(`Server is running in port http://localhost:${PORT}`)
})