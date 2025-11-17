import { IncomingMessage, ServerResponse } from "http";
import { TYPES } from "../types.js";
import { parseJsonBody } from "../bodyParser.js";
import { container } from "../container.js";

const controller:any = container.get(TYPES.CityController)

export async function router(req: IncomingMessage, res: ServerResponse){
    const url = new URL(req.url ?? '', `http://${req.headers.host}/api/v1`)
    const method = req.method || 'GET'

    if(method==='POST' && url.pathname === '/cities'){
        try{
            const body = await parseJsonBody(req)
            const result = await controller.handleAddCity(body);
            res.writeHead(result.status, { "Content-Type": "application/json"})
            res.end(JSON.stringify(result.body))
        } catch (err){
            res.writeHead(400, {"Content-Type":"appplication/json"})
            res.end(JSON.stringify({error: err.message ?? "Bad request"}));
        }

        return;
    }

    if(method==='GET' && url.pathname === '/cities'){
        const result = controller.handleListCities();
        res.writeHead(result.status, {"Content-Type": "application/json"})
        res.end(JSON.stringify(result.body))
        return;
    }

    if(method==='DELETE' && url.pathname.startsWith("/cities/")){
        const name = url.pathname.replace("/cities/","");
        const result = controller.handleDeleteCity(name);
        res.writeHead(result.status,{"Content-Type":"appplicaton/json"})
        if(result.status===204) return res.end()
        res.end(JSON.stringify(result.body))
        return
    }

    res.writeHead(404,{"Content-Type":"application/json"})
    res.end(JSON.stringify({error: "Not Found"}))
}