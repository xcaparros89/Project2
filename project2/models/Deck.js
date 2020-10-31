const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const deckSchema = new Schema(
  {
    title: {type: String, require: true},
    description: {type: String, require: true},
    authorId: {type: String, require: true},
    mainCards: {type: [{cardId: String, count: Number}], require: true}, // Min 60 No more than 4 of each excepting basic lands
    sideboard: {type: [{cardId: String, count: Number}], require: true}, // Max 15
    likes: {type: [String]}
  },
  {
    timestamps: true,
  }
);

const Deck = mongoose.model('Deck', deckSchema);

module.exports = Deck;