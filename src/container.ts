import "reflect-metadata"
import { Container } from "inversify"
import { TYPES } from "./types.js"
import { NominatimService } from "./services/nominatimService.js"
import { CityService } from "./services/cityService.js"
import { CityController } from "./controllers/cityController.js"

const container = new Container()

// Creates the DI (Dependency Injection) container and binds interfaces/identifiers to concrete classes.
container.bind(TYPES.CityService).to(CityService).inSingletonScope()
container.bind(TYPES.NominatimService).to(NominatimService).inSingletonScope()
container.bind(TYPES.CityController).toSelf().inSingletonScope()

export {container};