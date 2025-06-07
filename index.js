const EmailService = require("./src/services/EmailService");

async function main() {
  const emailService = new EmailService();

  const email = {
    id: "order789_user123",
    to: "test@example.com",
    subject: "Hello!",
    body: "This is a test email.",
  };

  try {
    const result = await emailService.sendEmail(email);
    console.log("Email send result:", result);
  } catch (error) {
    console.error("Error sending email:", error.message);
  }
}

main();
