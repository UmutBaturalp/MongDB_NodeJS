const express = require("express");
const { connectToDb, getDb } = require("./db");
const { ObjectId } = require("mongodb");
const app = express();
app.use(express.json());

let db;

connectToDb((err) => {
  if (!err) {
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
    db = getDb();
  } else {
    console.log(err);
  }
});

app.get("/books", (req, res) => {
  let books = [];
  const page = req.query.p || 0;
  const booksPerPage = 2;
  db.collection("books")
    .find()
    .sort({ author: 1 }) // Sıralama: yazar adına göre
    .skip(page * booksPerPage) // Sayfa sayısı
    .limit(booksPerPage) // Sayfa sayısı
    .toArray() // Verileri bir diziye dönüştür
    .then((books) => {
      res.status(200).json(books); // Başarı durumunda verileri döndür
    })
    .catch((error) => {
      console.error("Error fetching books:", error); // Hata durumunda log kaydı
      res.status(500).json({ error: "Could not fetch the documents" }); // Hata mesajı döndür
    });
});

app.post("/books", (req, res) => {
  const book = req.body;
  db.collection("books")
    .insertOne(book)
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((error) => {
      console.error("Error adding book:", error);
      res
        .status(500)
        .json({ error: "An error occurred while adding the book" });
    });
});

app.delete("/books/:id", (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    db.collection("books")
      .deleteOne({ _id: new ObjectId(req.params.id) })
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((error) => {
        console.error("Error deleting book:", error);
        res
          .status(500)
          .json({ error: "An error occurred while deleting the book" });
      });
  }
});

app.patch("/books/:id", (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    const updates = req.body;
    db.collection("books")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates })
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((error) => {
        console.error("Error updating book:", error);
        res
          .status(500)
          .json({ error: "An error occurred while updating the book" });
      });
  }
});
