import nodemailer from "nodemailer";

// Configure the transport options using Mailtrap credentials

///Production

var transporter = nodemailer.createTransport({
  host: "live.smtp.mailtrap.io",
  port: 587,
  auth: {
    user: "api",
    pass: "c8913540767574ef78871f8435e67647",
  },
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
  let digits = "0123456789";
  let code = "";
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
    from: "support.roamify@drbprojects.eu",
    to: tempUser.email,
    subject: "Your Roamify Verification Code",
    text: `Please use the following code to verify your email address: ${verificationCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; text-align: center; padding: 20px;">
        <img src="https://platform-treasure-find.vercel.app/icons/logo/logo.png" alt="Roamify Logo" style="width: 100px; height: auto; margin-bottom: 20px;">
        <h1 style="color: #007BFF;">Welcome to Roamify!</h1>
        <p style="font-size: 16px; color: #666;">Thank you for signing up! Please verify your email address to continue.</p>
        <div style="margin: 20px;">
          <p style="font-size: 24px; font-weight: bold; color: #000;">Verification Code:</p>
          <div style="background-color: #E0E0E0; padding: 10px; margin: 20px auto; width: 200px; font-size: 22px; font-weight: bold; border-radius: 5px; color: #000;">
            ${verificationCode}
          </div>
          <p style="font-size: 16px; color: #666;">Enter this code in our platform to complete the verification process.</p>
        </div>
        <footer style="font-size: 12px; color: #777; margin-top: 20px;">
          <p>If you did not request this email, please ignore it.</p>
          <p>For support, contact <a href="mailto:treasure.find.oni2024@gmail.com">treasure.find.oni2024@gmail.com</a></p>
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
