import http from "node:http"
import { router } from "./http/router.js";

const PORT = 4000;

const server = http.createServer(async (req,res)=> router(req,res))

// Only start listening when not running tests. Tests will import the server
// module and mock `node:http` to verify behavior without binding real sockets.
if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, ()=>{
        console.log(`Server running at http://localhost:${PORT}/api/v1`)
    })
}

export { server }