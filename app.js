import express from "express";
import mysql from "mysql2";
import uuid4 from "uuid4";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

dotenv.config();
const app = express();
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: "Too many requests from this IP, please try again in a minute.",
});

app.use(limiter);

app.use(express.json());

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.SQL_PASSWORD,
  database: "mydb",
});

connection.config.insecureAuth = true;

connection.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

app.post("/posts", (req, res) => {
  const { title, content, author } = req.body;
  const id = uuid4();
  const sql = `INSERT INTO blogPost (id, title, content, author) VALUES ('${id}', '${title}', '${content}', '${author}');`;
  connection.query(sql, function (err, result) {
    if (err) throw err;
    res.json({ status: "success", id: id });
  });
});

app.get("/posts", async (req, res) => {
  connection.query("SELECT * FROM blogPost", function (err, result, fields) {
    if (err) throw err;
    res.json(result);
  });
});

app.get("/posts/:id", (req, res) => {
  const { id } = req.params;
  connection.query(
    `SELECT * FROM blogPost WHERE id = '${id}' `,
    function (err, result) {
      if (err) throw err;
      res.json(result);
    }
  );
});

app.put("/posts/:id", (req, res) => {
  const { id } = req.params;
  const { title, content, author } = req.body;
  const sql = `UPDATE blogPost SET title = '${title}', content = '${content}', author = '${author}'  WHERE id = '${id}'`;
  connection.query(sql, function (err, result) {
    if (err) throw err;
    res.json({ staus: "success" });
  });
});

app.delete("/posts/:id", (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM blogPost WHERE id = '${id}'`;
  connection.query(sql, function (err, result) {
    if (err) throw err;
    res.json({ status: "success" });
  });
});

app.listen(process.env.PORT, () => {
  console.log(`port is running at 9000`);
});
