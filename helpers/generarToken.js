import jwt from "jsonwebtoken";

const generarId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const generarJWT = (datos) => {
  return jwt.sign(
    {
      id: datos.id,
      nombre: datos.nombre,
      email: datos.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "4h",
    }
  );
};

export { generarId, generarJWT };
