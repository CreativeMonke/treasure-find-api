import nodemailer from 'nodemailer';

// Configure the transport options using Mailtrap credentials

///Production

var transporter = nodemailer.createTransport({
  host: "live.smtp.mailtrap.io",
  port: 587,
  auth: {
    user: "api",
    pass: "c8913540767574ef78871f8435e67647"
  }
});

///Development
/*
var transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "7522c25d5ac76c",
        pass: "f312a4674bf82f"
    }
});
*/
function generateVerificationCode() {
  let digits = '0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += digits[Math.floor(Math.random() * 10)];
  }
  return code;
}

export default async function SendVerificationEmail(tempUser) {
  const verificationCode = generateVerificationCode();
  tempUser.verificationCode = verificationCode;
  await tempUser.save();
  const mailOptions = {
    from: 'support.onigim2024@drbprojects.eu',
    to: [tempUser.email],                // Recipient's email
    subject: 'Verificare adresa e-mail',
    text: `Vă rugăm să folosiți următorul cod pentru a verifica adresa de e-mail: ${verificationCode}`, // Fallback text version
    html: `
        <div style="font-family: Arial, sans-serif; color: #333; text-align: center; padding: 20px;">
        <img src="https://treasure-find.vercel.app/icons/logo/logo.png" alt="Email Profile Icon" style="width: 100px; height: auto; margin-bottom: 20px;">

          <h1 style="color: #007BFF;">Bine ați venit la OniGim 2024!</h1>
          <p style="font-size: 16px; color: #666;">Vă mulțumim că v-ați înregistrat! Vă rugăm să verificați adresa de e-mail pentru a începe!</p>
          <div style="margin: 20px;">
            <p style="font-size: 24px; font-weight: bold; color: #000;">Cod de verificare:</p>
            <div style="background-color: #E0E0E0; padding: 10px; margin: 20px auto; width: 200px; font-size: 22px; font-weight: bold; border-radius: 5px; color: #000;">
              ${verificationCode}
            </div>
            <p style="font-size: 16px; color: #666;">Introduceți acest cod în portalul web pentru a completa procesul de înregistrare.</p>
          </div>
          <footer style="font-size: 12px; color: #777; margin-top: 20px;">
            <p>Dacă nu ați solicitat acest e-mail, vă rugăm să-l ignorați</p>
            <p> Pentru asistență, contactați <a href="mailto:treasure.find.oni2024@gmail.com">treasure.find.oni2024@gmail.com</a></p>
          </footer>
        </div>
      `,
  };

  try {
    //let info = 
    await transporter.sendMail(mailOptions);
    //console.log("Verification email sent successfully", info);
  } catch (error) {
    console.error("Failed to send verification email", error);
  }
}
