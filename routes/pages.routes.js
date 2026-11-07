import express from "express";

export const pagesRouter = express.Router();

pagesRouter.get("/", (req, res) => {
  res.redirect("/home.html");
});

pagesRouter.get("/home.html", (req, res) => {
  res.sendFile("pages/home.html", { root: import.meta.dirname + "/.." });
});

pagesRouter.get("/movie.html", (req, res) => {
  res.sendFile("pages/movie.html", { root: import.meta.dirname + "/.." });
});

pagesRouter.get("/actors.html", (req, res) => {
  res.sendFile("pages/actors.html", { root: import.meta.dirname + "/.." });
});

pagesRouter.get("/actor.html", (req, res) => {
  res.sendFile("pages/actor.html", { root: import.meta.dirname + "/.." });
});

pagesRouter.get("/my-reviews.html", (req, res) => {
  res.sendFile("pages/my-reviews.html", { root: import.meta.dirname + "/.." });
});

pagesRouter.get("/login.html", (req, res) => {
  res.sendFile("pages/login.html", { root: import.meta.dirname + "/.." });
});

pagesRouter.get("/register.html", (req, res) => {
  res.sendFile("pages/register.html", { root: import.meta.dirname + "/.." });
});

pagesRouter.get("/forgot-password.html", (req, res) => {
  res.sendFile("pages/forgot-password.html", { root: import.meta.dirname + "/.." });
});

pagesRouter.use(express.static("pages"));

pagesRouter.use((req, res) => {
  res.status(404).sendFile("pages/404.html", {
    root: import.meta.dirname + "/..",
  });
});