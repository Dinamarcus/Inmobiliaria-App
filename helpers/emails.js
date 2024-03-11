import nodemailer from "nodemailer";

const emailRegistro = async (datos) => {
  var transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  console.log("datos", datos);

  const { email, nombre, token } = datos;

  // Enviar el correo
  await transport.sendMail({
    from: "BienesRaices.com",
    to: email,
    subject: "Confirma tu cuenta en BienesRaices",
    text: "Confirma tu cuenta en BienesRaices",
    html: `
      <h1>Confirma tu cuenta</h1>
      <p>Hola ${nombre}, sólo falta un paso para confirmar tu cuenta</p>
      <p>Presiona el siguiente enlace:</p>
      <a href="${process.env.BACKEND_URL}:${
      process.env.PORT ?? 4000
    }/auth/confirmar/${token}">Confirmar cuenta</a>
      <p>Si no realizaste esta petición, ignora este mensaje</p>
    `,
  });
};

const emailOlvide = async (datos) => {
  var transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  console.log("datos", datos);

  const { email, nombre, token } = datos;

  // Enviar el correo
  await transport.sendMail({
    from: "BienesRaices.com",
    to: email,
    subject: "Recuperar tu contraseña en BienesRaices",
    text: "Reestablece tu contraseña en BienesRaices",
    html: `
      <h1>Confirma tu cuenta</h1>
      <p>Hola ${nombre}, has solicitado reestablecer tu password</p>
      <p>Presiona el siguiente enlace:</p>
      <a href="${process.env.BACKEND_URL}:${
      process.env.PORT ?? 4000
    }/auth/olvide/${token}">Reestablecer Password</a>
      <p>Si no realizaste esta petición, ignora este mensaje</p>
    `,
  });
};

export { emailRegistro, emailOlvide };
