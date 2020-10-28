const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cardSchema = new Schema({}
);

const Card = mongoose.model('Card', cardSchema);

module.exports = Card;