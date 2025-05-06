import TempChange from "../../models/TempChange.js";
import nodemailer from "nodemailer";

function generateVerificationCode() {
  let digits = "0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += digits[Math.floor(Math.random() * 10)];
  }
  return code;
}

var transporter = nodemailer.createTransport({
  host: "live.smtp.mailtrap.io",
  port: 587,
  auth: {
    user: "api",
    pass: "c8913540767574ef78871f8435e67647",
  },
});
/* Debug
var transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "7522c25d5ac76c",
    pass: "f312a4674bf82f",
  },
});
*/
export async function sendVerificationEmail(req, res) {
  const { email, change, type } = req.body;
  if (!email || !change || !type) {
    return res.status(400).json({
      status: "failed",
      message: "Missing required fields",
    });
  }

  try {
    const existingChange = await TempChange.findOne({ change, type });
    if (existingChange) {
      return res.status(202).json({
        status: "failed",
        data: existingChange,
        message:
          "A verification request has already been sent to this email address.",
      });
    } else {
      const verificationCode = generateVerificationCode();
      const tempChange = new TempChange({
        change,
        verificationCode,
        type,
      });
      await tempChange.save();

      const mailOptions = {
        from: "support.roamify@drbprojects.eu",
        to: email,
        subject: "Verification Code",
        text: `Please use the following code to verify your information: ${verificationCode}`,
        html: `
        <div style="font-family: Arial, sans-serif; color: #333; text-align: center; padding: 20px;">
          <img src="https://platform-treasure-find.vercel.app/icons/logo/logo.png" alt="Email Profile Icon" style="width: 100px; height: auto; margin-bottom: 20px;">
          <h1 style="color: #007BFF;">Welcome to Roamify!</h1>
          <p style="font-size: 16px; color: #666;">Thank you for using our service! Please verify your email address to continue.</p>
          <div style="margin: 20px;">
            <p style="font-size: 24px; font-weight: bold; color: #000;">Verification Code:</p>
            <div style="background-color: #E0E0E0; padding: 10px; margin: 20px auto; width: 200px; font-size: 22px; font-weight: bold; border-radius: 5px; color: #000;">
              ${verificationCode}
            </div>
            <p style="font-size: 16px; color: #666;">Enter this code on our platform to complete the verification process.</p>
          </div>
          <footer style="font-size: 12px; color: #777; margin-top: 20px;">
            <p>If you did not request this email, please ignore it.</p>
            <p>For assistance, contact <a href="mailto:treasure.find.oni2024@gmail.com">treasure.find.oni2024@gmail.com</a></p>
          </footer>
        </div>
      `,
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({
        status: "success",
        data: tempChange,
        message: "Verification email sent successfully",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
}
