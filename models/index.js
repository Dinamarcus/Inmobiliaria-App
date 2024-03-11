import Propiedad from "../models/Propiedad.js";
import Precio from "./Precio.js";
import Categoria from "./Categoria.js";
import Usuario from "./Usuario.js";
import Mensaje from "./Mensaje.js";

Propiedad.belongsTo(Precio, { as: "precio", foreignKey: "precioId" }); //Se lee de derecha a izquierda, para relaciones 1:1
Propiedad.belongsTo(Categoria, { as: "categoria", foreignKey: "categoriaId" });
Usuario.hasOne(Propiedad);
Propiedad.hasMany(Mensaje, { as: "mensajes", foreignKey: "propiedadId" });

Mensaje.belongsTo(Propiedad, { as: "propiedad", foreignKey: "propiedadId" });
Mensaje.belongsTo(Usuario, { as: "usuario", foreignKey: "usuarioId" });

export { Propiedad, Precio, Categoria, Usuario, Mensaje };
