import express from "express";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server started on PORT: ${process.env.PORT || 3000}`);
});
