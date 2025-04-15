import connectDB from "@/config/db";
import Template from "@/models/Template";

export default async function Home() {
  await connectDB();

  const newTemplate = new Template({
    name: "Welcome Email",
    type: "email",
    html: "<h1>Welcome {{name}}!</h1><p>Thank you for joining our platform. We're excited to have you on board.</p><p>{{customMessage}}</p>",
    placeholders: ["name", "customMessage"]
  });

  try {
    const savedTemplate = await newTemplate.save();
    console.log("✅ Template saved:", savedTemplate);
  } catch (error) {
    console.error("❌ Error saving template:", error);
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      ✅ Template creation attempt finished. Check your DB and logs.
    </div>
  );
}