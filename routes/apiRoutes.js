import Express from "express";
import { propiedades } from "../controllers/apiController.js";

const Router = Express.Router();

Router.get("/propiedades", propiedades);

export default Router;
