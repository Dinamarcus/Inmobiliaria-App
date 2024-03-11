import bcrypt from "bcrypt";

const usuarios = [
  {
    nombre: "admin",
    email: "admin@admin.com",
    confirmado: 1,
    password: bcrypt.hashSync("password", 10),
  },
];

export default usuarios;
