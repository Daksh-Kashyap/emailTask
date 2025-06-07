const express=require("express");

const EmailService = require("./src/services/EmailService");
const app=express();


// Middleware to parse JSON body
app.use(express.json());

const emailService = new EmailService();

app.post("/send-email",async(req,res)=>{
    const email=req.body;
    if (!email.id || !email.to || !email.subject || !email.body) {
    return res.status(400).json({ error: "Missing required email fields" });
  }
   try {
    const result = await emailService.sendEmail(email);
    res.json({
      finalStatus: result.finalStatus,
      attempts: result.attempts,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

app.listen(3000, () => {
  console.log(`app is listening in port 3000`);
});