const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const deckSchema = new Schema(
  {
    username: {type: String, require: true},
    email: {type: String, require: true},
    password: {type: String, require: true},
  },
  {
    timestamps: true,
  }
);

const Deck = mongoose.model('Deck', deckSchema);

module.exports = Deck;