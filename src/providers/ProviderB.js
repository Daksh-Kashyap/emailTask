class ProviderB {
  async sendEmail(email) {
    console.log("ProviderB: Trying to send email...");
    const success = Math.random() > 0.5; 
    await new Promise(resolve => setTimeout(resolve, 500));

    if (success) {
      console.log("ProviderB: Email sent successfully.");
      return { success: true };
    } else {
      console.log("ProviderB: Failed to send email.");
      throw new Error("ProviderB failed");
    }
  }
}

module.exports = ProviderB;
