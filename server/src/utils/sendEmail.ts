import nodemailer from "nodemailer";

export async function sendEmail(to: string, html: string) {
  
//   let testAccount = await nodemailer.createTestAccount();
//   console.log("testAccount: ", testAccount);
  
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'hvsg7l7gj45f6nl2@ethereal.email', // generated ethereal user
      pass: 'jm2uex2Unqg9EDm4Dx', // generated ethereal password
    },
  });

  let info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to: to, // list of receivers
    subject: "Change Password", // Subject line
    html: html
  });

  console.log("Message sent: %s", info.messageId);

  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
