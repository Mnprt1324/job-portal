const nodeMalier = require("nodemailer");


const sendmail = (otp, email) => {
   try {
    const tranport = nodeMalier.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.GMAIL_PASS,
        }
    }
    )
    const mailOptions = {
      from: process.env.EMAIL, // Your sender email
      to: email, // Recipient email
      subject: "Reset Your Password - OTP Verification",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 2px 2px 12px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
          <p style="font-size: 16px; color: #555;">Hello,</p>
          <p style="font-size: 16px; color: #555;">
            We received a request to reset your password. Use the OTP below to proceed:
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="display: inline-block; font-size: 22px; font-weight: bold; color: #fff; background: #007bff; padding: 10px 20px; border-radius: 5px;">
              ${otp}
            </span>
          </div>
          <p style="font-size: 14px; color: #777;">
            If you did not request this, please ignore this email. Your account is safe.
          </p>
          <p style="font-size: 14px; color: #777;">Best regards,<br/><strong>Your Company Name</strong></p>
        </div>
      `,
    };
    
  return tranport.sendMail(mailOptions);
   } catch (error) {
     throw error;
   }

}

module.exports=sendmail;