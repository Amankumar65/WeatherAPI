import { IncomingMessage } from "http";

export async function parseJsonBody(req: IncomingMessage): Promise<any>{
    return new Promise((resolve,reject)=>{
        let body = ''
        req.on("data",chunk=>{
            body+=chunk
        })
        
        req.on("end",()=>{
            if(!body) return resolve({});
             try{
                const parsed = JSON.parse(body);
                resolve(parsed);
            }catch(e){
                reject(new Error("Invalid JSON"));
            }
        })

        req.on("error",err=> reject(err))
       
    })
}