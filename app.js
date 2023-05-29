const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 8080;

app.use(express.json());

const add = async (count, data) => {
  const user = count.find((user) => user.product === data.product);

  if (user) {
    user.volume = (+user.volume + +data.volume).toString();
    fs.promises.writeFile(
      path.join(__dirname, "ombor.json"),
      JSON.stringify(count, null, 2),
      "utf-8"
    );
    return "Successfully";
  } else {
    count.push(data);

    fs.promises.writeFile(
      path.join(__dirname, "ombor.json"),
      JSON.stringify(count, null, 2),
      "utf-8"
    );
    return true;
  }
};

const remove = async (count, data) => {
  const user = count.find((user) => user.product === data.product);
  console.log(data.volume);
  if (user) {
    const currentVolume = +user.volume;
    const removalVolume = +data.volume;
    if (currentVolume > 0 && removalVolume <= currentVolume) {
      user.volume = (currentVolume - removalVolume).toString();
      fs.promises.writeFile(
        path.join(__dirname, "ombor.json"),
        JSON.stringify(count, null, 2),
        "utf-8"
      );
      return "Successfully";
    } else {
      return "Empty";
    }
  }
};

const history = async (count, res) => {
  const historyTable = [];

  count.forEach((item, index) => {
    if (item.volume > 0) {
      historyTable.push({
        index: index + 1,
        product: item.product,
        volume: item.volume,
        action: "Sale",
        time: item.time,
      });
    } else if (item.volume < 0) {
      historyTable.push({
        index: index + 1,
        product: item.product,
        volume: Math.abs(item.volume),
        action: "Remove",
        time: item.time,
      });
    } else {
      historyTable.push({
        index: index + 1,
        product: item.product,
        volume: Math.abs(item.volume),
        action: "Add",
        time: item.time,
      });
    }
  });

  res.json(historyTable);
};

const show = async (count, res) => {
  const inventory = count.map((item, index) => ({
    ID: index + 1,
    product: item.product,
    volume: item.volume,
    time: item.time,
  }));

  res.json(inventory);
};

app.post("/add", async (req, res) => {
  const { product, volume } = req.body;
  const time = new Date();
  const count = JSON.parse(
    await fs.promises.readFile(path.join(__dirname, "ombor.json"))
  );
  const result = await add(count, { product, volume, time });
  res.send(result.toString());
});

app.delete("/remove", async (req, res) => {
  const { product, volume } = req.body;
  const time = new Date();
  const count = JSON.parse(
    await fs.promises.readFile(path.join(__dirname, "ombor.json"))
  );
  const result = await remove(count, { product, volume, time });
  res.send(result.toString());
});

app.get("/show", async (req, res) => {
  const count = JSON.parse(
    await fs.promises.readFile(path.join(__dirname, "ombor.json"))
  );
  show(count, res);
});

app.get("/history", async (req, res) => {
  const count = JSON.parse(
    await fs.promises.readFile(path.join(__dirname, "ombor.json"))
  );
  history(count, res);
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
