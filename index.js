const express = require("express");
const cors = require("cors");
const { connection } = require("./config/db");
require("dotenv").config();
const { AdModel } = require("./models/Ad.Model");
const app = express();
app.use(cors());
app.use(express.json());
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { UserModel } = require("./models/User.Model");

app.get("/classifieds", async (req, res) => {
  const { page, limit, Category, search, sortBy, order } = req.query;
  const query = {};

  // if (Category) {
  //   query.Category = Category;
  // }
  // if (search) {
  //   query.name = { $regex: search, $options: "i" };
  // }

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }
  if (Category) {
    query.Category = Category;
  }
  const sortObj = {};
  sortObj[sortBy] = order == "desc" ? -1 : 1;
  // const skip = (page - 1)
  // const todaldocs = await AdModel.countDocuments();
  // const totalpage = Math.ceil(todaldocs / limit);
  const skip = (page - 1) * (limit || 1);
  const todaldocs = await AdModel.countDocuments(query);
  const totalpage = Math.ceil(todaldocs / limit);
  try {
    const products = await AdModel.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));
    res.status(200).send({ msg: true, products, todaldocs, totalpage });
  } catch (error) {
    res.status(500).send({ error });
  }
});

app.post("/classifieds", async (req, res) => {
  try {
    const newAd = req.body;
    const ad = new AdModel(newAd);
    await ad.save();
    res.status(201).send({ message: "data posted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "internal server error" });
  }
});

app.delete("/classifieds/:id", async (req, res) => {
  try {
    const adId = req.params.id;
    const deletedAd = await AdModel.findByIdAndDelete(adId);
    if (!deletedAd) {
      return res.status(404).send({ message: "Ad not found" });
    }
    res.status(200).send({ message: "Ad deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.post("/signup", async (req, res) => {
  let { username, email, password } = req.body;
  bcrypt.hash(password, 3, async function (err, hash) {
    const new_user = new UserModel({
      username,
      email,
      password: hash,
    });
    try {
      await new_user.save();
      res.send({ message: "signup successful" });
    } catch (error) {
      console.log(error);
      res.status(500).send("something went wrong, please try again leter");
    }
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) {
    res.send("sign up first");
  } else {
    bcrypt.compare(password, user.password, function (err, result) {
      if (result) {
        var token = jwt.sign({ user_id: user._id }, process.env.SECRET_KEY);
        res.send({ message: "log in successful", token: token });
      } else {
        res.send({ message: "login faild , invalid credentials" });
      }
    });
  }
});

app.listen(5000, async () => {
  try {
    await connection;
    console.log("connected to db");
    // console.log("port running on 5000");
  } catch (error) {
    console.log("error connecting to db");
    console.log(error);
  }
});
