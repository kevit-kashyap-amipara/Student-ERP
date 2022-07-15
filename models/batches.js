const mongoose = require("mongoose");
// For already exist collection
const batchesSchema = new mongoose.Schema({});
const Batches = mongoose.model('Batches', batchesSchema, 'batches');
module.exports = Batches;