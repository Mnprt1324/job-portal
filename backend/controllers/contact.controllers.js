const Contact = require("../models/contact.model"); // Import Contact Model
const nodemailer = require("nodemailer");

// Admin Email (Update with your admin email)
const ADMIN_EMAIL = process.env.EMAIL; 

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL, 
  auth: {
    user: process.env.EMAIL, 
    pass: process.env.GMAIL_PASS, 
  },
});

// Contact Form Submission Controller
module.exports.contactUs = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate Required Fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    // Save Contact Form Data in Database
    const newContact = new Contact({ name, email, subject, message });
    await newContact.save();

    // Email Content
    const mailOptions = {
        from: email, 
        to: ADMIN_EMAIL, 
        subject: `📩 New Contact Form Submission: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1); background: #f9f9f9;">
            <h2 style="color: #007bff; text-align: center;">📩 New Contact Form Submission</h2>
            <hr style="border: 0; height: 1px; background: #ddd; margin: 15px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #007bff; text-decoration: none;">${email}</a></p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <div style="background: #fff; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
              <p style="margin: 0; color: #333;">${message}</p>
            </div>
            <hr style="border: 0; height: 1px; background: #ddd; margin: 15px 0;">
            <p style="font-size: 12px; color: #666; text-align: center;">
              This message was sent via the contact form on JobOrbit.
            </p>
          </div>
        `,
      };
      

    // Send Email to Admin
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Your message has been sent successfully!",
    });

  } catch (error) {
    console.error("Error sending contact message:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
