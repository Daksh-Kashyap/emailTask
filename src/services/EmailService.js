const ProviderA = require("../providers/ProviderA");
const ProviderB = require("../providers/ProviderB");
const RateLimiter = require("../utils/RateLimiter");

class EmailService {
  constructor() {
    this.ProviderA = new ProviderA();
    this.ProviderB = new ProviderB();
    this.maxRetries = 3; // Max retry attempts
    this.baseDelay = 500; // Initial delay in ms for retry backoff
    this.sentEmails = new Map(); //storing sent email in memory or to track sent email ids
    this.rateLimiter = new RateLimiter(3, 10000); //3 emails per 10second
  }

  //(for backoff delay)
  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  // Main function to send email with retry logic
  async sendEmail(email) {
    // let attempts = 0;
    // while (attempts <= this.maxRetries) {
    //   try {
    //     console.log(`Attempt #${attempts + 1} to send email`);
    //     const result = await this.ProviderA.sendEmail(email);
    //     return result;
    //   } catch (error) {
    //     console.log(`Attempt #${attempts + 1} failed: ${error.message}`);
    //     attempts++;
    //     if (attempts > this.maxRetries) {
    //       throw new Error("All retries failed");
    //     }
    //     // Exponential backoff delay: baseDelay * 2^attempt
    //     const delay=this.baseDelay*Math.pow(2,attempts);
    //     console.log(`waiting for ${delay} ms before retrying..`);
    //     await this.wait(delay)

    //   }
    // }
    if (!this.rateLimiter.canSend()) {
      return {
        id: email.id,
        attempts: [],
        finalStatus: "failure",
        error: "Rate limit exceeded. Try again later.",
      };
    }

    if (this.sentEmails.has(email.id)) {
      return {
        id: email.id,
        attempts: [],
        finalStatus: "duplicate", // already sent
      };
    }

    const status = {
      id: email.id,
      attempts: [],
      finalStatus: "pending",
    };

    //first try with ProviderA
    const providerAResult = await this.sendWithRetries(
      this.ProviderA,
      email,
      status,
      "ProviderA"
    );
    if (providerAResult.success) {
      status.finalStatus = "success";
      this.sentEmails.set(email.id, status);
      return status;
    }
    // Fallback: Try with Provider B
    const providerBResult = await this.sendWithRetries(
      this.ProviderB,
      email,
      status,
      "ProviderB"
    );
    if (providerBResult.success) {
      status.finalStatus = "success";
      this.sentEmails.set(email.id, status);
      return status;
    }

    status.finalStatus = "failure";
    this.sentEmails.set(email.id, status);
    return status;
  }
  async sendWithRetries(provider, email, status, providerName) {
    let delay = this.baseDelay;
    const maxRetries = this.maxRetries;
    for (let attempts = 1; attempts <= maxRetries; attempts++) {
      try {
        await provider.sendEmail(email);
        status.attempts.push({
          provider: providerName,
          attempts,
          status: "success",
          timeStamp: new Date().toISOString(),
        });
        return { success: true };
      } catch (error) {
        status.attempts.push({
          provider: providerName,
          attempts,
          status: "failure",
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }
      if (attempts < maxRetries) {
        await this.wait(delay);
        delay *= 2;
      }
    }
    return { success: false };
  }
}

module.exports = EmailService;
