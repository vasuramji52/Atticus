import { db } from "../config/firebase-admin";

(async () => {
  try {
    // Try writing a tiny doc to a test collection
    const testRef = await db.collection("connection_test").add({
      message: "Hello Firestore 👋",
      timestamp: new Date().toISOString(),
    });

    console.log("✅ Firestore write successful! Document ID:", testRef.id);

    // Try reading it back
    const docSnap = await testRef.get();
    console.log("📄 Document data:", docSnap.data());

    // Optional: delete after test
    await testRef.delete();
    console.log("🧹 Cleaned up test document.");

    console.log("🎉 Firestore connection verified!");
  } catch (err) {
    console.error("❌ Firestore connection failed:", err);
  }
})();