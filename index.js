import express from "express";
import { MongoClient, ObjectId } from "mongodb";

const app = express();
const port = 1234;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.set("view engine", "pug");

// ----- MongoDB connection -----
const dbUrl = "mongodb+srv://testdbuser:ToPyFpxMSq3yHcIl@cluster0.vvmmq4m.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(dbUrl);
await client.connect();
const db = client.db("testdb");
console.log("MongoDB connected");

// ----- DB functions -----
async function getLinks() {
  return await db.collection("menuLinks").find({}).sort({ weight: 1 }).toArray();
}

async function getSingleLink(id) {
  return await db.collection("menuLinks").findOne({ _id: new ObjectId(String(id)) });
}

async function addLink(link) {
  await db.collection("menuLinks").insertOne(link);
  console.log("link added");
}

async function deleteLink(id) {
  await db.collection("menuLinks").deleteOne({ _id: new ObjectId(String(id)) });
  console.log("link deleted");
}

async function editLink(filter, link) {
  await db.collection("menuLinks").updateOne(filter, { $set: link });
  console.log("link updated");
}

// ----- Routes -----
app.get("/", async (req, res) => {
  let links = await getLinks();
  res.render("index", { title: "Home", menu: links });
});

app.get("/admin/menu", async (req, res) => {
  let links = await getLinks();
  res.render("menu-list", { title: "Menu Admin", menu: links });
});

app.get("/admin/menu/add", async (req, res) => {
  res.render("menu-add", { title: "Add link" });
});

app.post("/admin/menu/add/submit", async (req, res) => {
  let newLink = {
    weight: parseInt(req.body.weight),
    path: req.body.path,
    name: req.body.name
  };
  await addLink(newLink);
  res.redirect("/admin/menu");
});

app.get("/admin/menu/delete", async (req, res) => {
  await deleteLink(req.query.linkId);
  res.redirect("/admin/menu");
});

app.get("/admin/menu/edit", async (req, res) => {
  let linkToEdit = await getSingleLink(req.query.linkId);
  res.render("menu-edit", { title: "Edit link", editLink: linkToEdit });
});

app.post("/admin/menu/edit/submit", async (req, res) => {
  let filter = { _id: new ObjectId(String(req.body.linkId)) };
  let link = {
    weight: parseInt(req.body.weight),
    path: req.body.path,
    name: req.body.name
  };
  await editLink(filter, link);
  res.redirect("/admin/menu");
});

// ----- Start server -----
app.listen(port, () => {
  console.log(`Running at http://localhost:${port}`);
});
