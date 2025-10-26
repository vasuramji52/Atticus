import app from "./app";
import appointmentRoutes from "./routes/appointments";
import classifyRoutes from "./routes/classify"
app.use("/api/appointments", appointmentRoutes);
app.use("api/classify", classifyRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});