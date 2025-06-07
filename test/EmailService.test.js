const EmailService = require("../src/services/EmailService");
describe("EmailService", () => {
  test("send email successfully", async () => {
    const emailService = new EmailService();

    const email = {
      id: "test_email_1",
      to: "test@example.com",
      subject: "Test",
      body: "This is a test",
    };

    const result = await emailService.sendEmail(email);
    expect(result.finalStatus).toBe("success");
    // Optional: Check that at least 1 attempt was made
    expect(result.attempts.length).toBeGreaterThan(0);
  });

  test("Rate limiter blocks email after limit", async () => {
    const emailService = new EmailService();
    const promises = [];
    for (let i = 0; i < 5; i++) {
      const email = {
        id: `rate_test_${i}`,
        to: `user${i}@example.com`,
        subject: `Test ${i}`,
        body: "Testing rate limit",
      };
      promises.push(emailService.sendEmail(email));
    }
    const result = await Promise.all(promises);

    const failures = result.filter((r) => r.finalStatus === "failure");
    expect(failures.length).toBeGreaterThan(0);
    // Add delay to allow all async logs to complete
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });
});
