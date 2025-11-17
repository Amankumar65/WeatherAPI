import http from "node:http"
import { router } from "./http/router.js";

const PORT = 3000;

const server = http.createServer(async (req,res)=> router(req,res))

server.listen(PORT, ()=>{
    console.log(`Server running at http://localhost:${PORT}/v1/api`)
})