import  connectDB from "@/config/db";
import User from "@/models/User";

export default async function Home() {
  await connectDB();

  const newUser = new User({
    username: "testuser",
    password: "123456",
    marketingCampaigns: [],
    rol: "employee",
  });

  try {
    const savedUser = await newUser.save();
    console.log("✅ User saved:", savedUser);
  } catch (error) {
    console.error("❌ Error saving user:", error);
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      ✅ User creation attempt finished. Check your DB and logs.
    </div>
  );
}
