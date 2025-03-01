import { createServer } from "http";
import { createConnection } from "mysql2";
import { URL } from "url";
import { 
  createUser,
  getUser,
  updateUser,
  deleteUser
} from "./feature/user/user.js";
import { initMigrate } from "./app/db/migration.js"

const db = createConnection({
  host: process.env.MYSQL_HOST,
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  insecureAuth: true,
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
    process.exit(1);
  }
  initMigrate(db);
  console.info("MySQL Connected...");
});

const server = createServer(async (req, res) => {
  const { method, url } = req;
  const parsedUrl = new URL(url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const queryParams = Object.fromEntries(parsedUrl.searchParams.entries());

  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    let payload = {};
    if (body) {
      try {
        payload = JSON.parse(body);
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ 
          success: false,
          result: { error: "Invalid JSON" }
        }));
        return;
      }
    }

    if (method === "POST" && pathname === "/create") {
      createUser(db, res, payload);
      return;
    }
    if (
      method === "GET" && (pathname.startsWith("/get/") || pathname === "/get")
    ) {
      const id = parsedUrl.pathname.split("/")[2];
      getUser(db, res, id, queryParams);
      return;
    }
    if (method === "PATCH" && pathname.startsWith("/update/")) {
      const id = parsedUrl.pathname.split("/")[2];
      updateUser(db, res, id, payload);
      return;
    }
    if (
      method === "DELETE"
      && (pathname.startsWith("/delete/") || pathname === "/delete")
    ) {
      const id = parsedUrl.pathname.split("/")[2];
      deleteUser(db, res, id);
      return;
    }
    
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, result: { error: "Not Found" } }));
  });
});

const PORT = 8080;
server.listen(PORT, () => {
  console.info(`Server started on port ${PORT}`);
});
