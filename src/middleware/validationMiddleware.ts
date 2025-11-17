import { IncomingMessage, ServerResponse } from "http";
import { parseJsonBody } from "../bodyParser.js";
import { citySchema } from "../validators/cityValidator.js";

export async function validateCityRequest(req: IncomingMessage,res: ServerResponse){
    try{
        const body = await parseJsonBody(req)
        // Joi validate
        const value = citySchema.validateAsync(body,{abortEarly: false})
        // return the validate value for controller to use
        return {valid: true, value};
    }catch(e){
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");

        // Joi error structure contains details, show simplified message
        const message = e?.details ? e.details.map((d: any)=> d.message).join(', ') : e.message
        res.end(JSON.stringify({error: 'Validation failed', message}))
        return { valid: false}
    }
}