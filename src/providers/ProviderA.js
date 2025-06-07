class ProviderA {
  async sendEmail(email) {
    console.log("ProviderA: Trying To Send Email....");

    // Step 2: Randomly fail 30% of the time
    const success = Math.random() > 0.3;
    // Step 1: Wait for 500ms (like a real email API delay)
    await new Promise((resolve) => setTimeout(resolve, 500)); //for delay
    if (success) {
      console.log("ProviderA: Email sent successfully.");
      return { success: true };
    } else {
      console.log("ProviderA: Failed to send email.");
      throw new Error("ProviderA failed");
    }
  }
}

module.exports = ProviderA;
