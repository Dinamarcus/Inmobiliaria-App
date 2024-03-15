import nodemailer from "nodemailer";

const emailRegistro = async (datos) => {
  var transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  console.log("datos", datos);

  const { email, nombre, token } = datos;

  // Enviar el correo
  await transport.sendMail({
    from: "noreply@bienesraices.com",
    to: email,
    subject: "Confirma tu cuenta en BienesRaices",
    text: "Confirma tu cuenta en BienesRaices",
    html: `
    <body style="background-color: #f0f0f0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
        <div style="padding: 20px; text-align: center; background-color: #f8f8f8;">
            <h2 style="margin: 0; color: #333333;">BienesRaices</h2>
            <p style="margin: 0; color: #777777;">Confirma tu cuenta</p>
        </div>

        <div style="padding: 20px;">
            <h1 style="color: #333333;">Hola ${nombre}!</h1>
            <p style="color: #777777;">Sólo falta un paso para confirmar tu cuenta. Presiona el siguiente enlace:</p>
            <a href="${
              process.env.PORT === 8080 || process.env.PORT === "8080"
                ? "https://inmobiliaria-app-dev-zqsr.2.us-1.fl0.io"
                : `http://localhost:${process.env.PORT}`
            }/auth/confirmar/${token}" style="display: inline-block; margin-top: 10px; padding: 10px 20px; background-color: #007bff; color: #ffffff; border-radius: 5px; text-decoration: none;">Confirmar cuenta</a>
            <p style="color: #777777;">Si no realizaste esta petición, ignora este mensaje</p>
        </div>

        <div style="padding: 20px; text-align: center; background-color: #f8f8f8;">
            <p style="margin: 0; color: #777777;">© ${new Date().getFullYear()} BienesRaices. All rights reserved.</p>
        </div>
    </div>
</body>
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

  await transport.sendMail({
    from: "noreply@bienesraices.com",
    to: email,
    subject: "Confirma tu cuenta en BienesRaices",
    text: "Confirma tu cuenta en BienesRaices",
    html: `
    <body style="background-color: #f0f0f0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
          <div style="padding: 20px; text-align: center; background-color: #f8f8f8;">
              <h2 style="margin: 0; color: #333333;">BienesRaices</h2>
              <p style="margin: 0; color: #777777;">Cambio de Password</p>
          </div>

          <div style="padding: 20px;">
              <h1 style="color: #333333;">Hola ${nombre}!</h1>
              <p style="color: #777777;">Sólo falta un paso para cambiar tu password. Presiona el siguiente enlace:</p>
              <a href="${
                process.env.PORT === 8080 || process.env.PORT === "8080"
                  ? "https://inmobiliaria-app-dev-zqsr.2.us-1.fl0.io"
                  : `http://localhost:${process.env.PORT}`
              }/auth/olvide/${token}" style="display: inline-block; margin-top: 10px; padding: 10px 20px; background-color: #007bff; color: #ffffff; border-radius: 5px; text-decoration: none;">Cambiar Password</a>
              <p style="color: #777777;">Si no realizaste esta petición, ignora este mensaje</p>
          </div>

          <div style="padding: 20px; text-align: center; background-color: #f8f8f8;">
              <p style="margin: 0; color: #777777;">© ${new Date().getFullYear()} BienesRaices. All rights reserved.</p>
          </div>
      </div>
    </body>
    `,
  });
};

export { emailRegistro, emailOlvide };
