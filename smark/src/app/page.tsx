import connectDB from "@/config/db";
import Template from "@/models/Template";

export default async function Home() {
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      Welcome to <strong>Smark: Automated Ads</strong>
    </div>
  );
}