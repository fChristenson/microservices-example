const fetch = require("node-fetch");
const express = require("express");
// notice that here we have duplicated our models from the other services
// this is bad, you should extract the common code in to a npm module
// that you can then import in to your project just like any other package
const Video = require("./models/video_model");
const Book = require("./models/books_model");
const app = express();

app.get("/", (req, res) => {
  res.json({ msg: "search" });
});

// /api/v1/<something> is a way to version endpoints and it is very useful
// because it allows you to add new endpoints without breaking old ones
// e.g /api/v2/<something> could be a new version of the same endpoint type
app.get("/api/v1/search", async (req, res) => {
  // we don't want to await we want both request to run at the same time
  const videosPromise = Video.find({});
  const booksPromise = Book.find({});
  const promises = [videosPromise, booksPromise];
  const [videos, books] = await Promise.all(promises);

  res.json(videos.concat(books));
});

/*
  Calling other services from a service is dangerous.
  If those services make their own calls there is a chance
  that you will get a circular call chain or that every request
  will take a lot of time.
  
  However crosscutting services such as this have to do it
  so this makes it very important to have the 1 hop rule or
  a message queue for all service to service communication.
  
  The 1 hop rule is that a service can not start a call chain
  longer than 1, here it is ok because:
  "search -> books|videos -> <no more calls>"
*/
app.get("/api/v1/search/depends-on", async (req, res) => {
  try {
    // we don't want to await we want both request to run at the same time
    const videoPromise = fetch("http://videos:3000/");
    const bookPromise = fetch("http://books:3000/");
    const promises = [videoPromise, bookPromise];
    const [videoResponse, bookResponse] = await Promise.all(promises);
    const videoJson = await videoResponse.json();
    const bookJson = await bookResponse.json();

    res.json({ video: videoJson, book: bookJson });
  } catch (e) {
    res.status(500).json(e);
  }
});

module.exports = app;
