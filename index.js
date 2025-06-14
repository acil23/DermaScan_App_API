import Hapi from "@hapi/hapi";
import predictRoutes from "./routes/predict.js";
import historyRoutes from "./routes/history.js";
import usersRoutes from "./routes/users.js";

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: "0.0.0.0",
    routes: {
      cors: {
        origin: ["*"], // Atau bisa diatur ke ['http://localhost:3000'] jika lebih aman
        additionalHeaders: ["content-type"],
      },
    },
  });

  server.route([...usersRoutes, ...historyRoutes]);
  server.route(predictRoutes);

  await server.start();
  console.log("🚀 Server running at:", server.info.uri);
};

init();
