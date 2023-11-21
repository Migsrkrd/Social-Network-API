const mongoose = require('mongoose');

const thoughtSchema = new mongoose.Schema({
    thoughtText: { type: String, required: true, Trimmed: true },
    createdAt: { type: Date, default: Date.now },
    username: { type: String, required: true},
    reactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'reaction' }]
    });

const thought = mongoose.model('user', thoughtSchema);

const handleError = (err) => console.error(err);

// Will add data only if collection is empty to prevent duplicates
// More than one document can have the same name value
user.find({})
  .exec()
  .then(collection => {
    if (collection.length === 0) {
      user
        .insertMany(
          [
            { thoughtText: 'whatsup', username: 'Testing'},
            { thoughtText: 'im bored', username: 'Stevio'},
            { thoughtText: 'im hungry', username: 'Watsoin'},
            { thoughtText: 'im sad', username: 'Swagger'},
            { thoughtText: 'idk again', username: 'PeterParker'},
            { thoughtText: 'what time is it?', username: 'HulkHogan'},
            { thoughtText: 'testing again', username: 'idk'},
          ]
        )
        .catch(err => handleError(err));
    }
  });

module.exports = thought;