const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
res.json({
status: "ok",
name: "DARK ZOXS AI",
message: "Server is running"
});
});

app.post("/api/chat", async (req, res) => {
const message = req.body?.message;

if (typeof message !== "string" || !message.trim()) {
return res.status(400).json({
error: "اكتب رسالة صحيحة أولًا."
});
}

if (message.length > 10000) {
return res.status(400).json({
error: "الرسالة طويلة جدًا."
});
}

if (!process.env.GROQ_API_KEY) {
return res.status(503).json({
error: "الذكاء الاصطناعي لم يتم ربطه بعد. أضف GROQ_API_KEY في إعدادات البيئة."
});
}

try {
const response = await fetch(
"https://api.groq.com/openai/v1/chat/completions",
{
method: "POST",
headers: {
"Content-Type": "application/json",
"Authorization": "Bearer ${process.env.GROQ_API_KEY}"
},
body: JSON.stringify({
model: process.env.AI_MODEL || "llama-3.3-70b-versatile",
messages: [
{
role: "system",
content: "أنت DARK ZOXS AI، مساعد ذكي يتحدث العربية بوضوح، ويساعد في البرمجة والتعلم وحل المشكلات."
},
{
role: "user",
content: message.trim()
}
],
temperature: 0.7,
max_tokens: 2048
})
}
);

const data = await response.json();

if (!response.ok) {
  console.error("AI provider error:", response.status);
  return res.status(502).json({
    error: "تعذر الحصول على رد من مزود الذكاء الاصطناعي. تحقق من إعدادات API وحدود الاستخدام."
  });
}

const reply = data.choices?.[0]?.message?.content;

if (!reply) {
  return res.status(502).json({
    error: "لم يصل رد صالح من النموذج."
  });
}

res.json({ reply });

} catch (error) {
console.error("Chat request failed:", error.message);
res.status(500).json({
error: "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي."
});
}
});

app.listen(PORT, "0.0.0.0", () => {
console.log("DARK ZOXS AI running on port ${PORT}");
});
