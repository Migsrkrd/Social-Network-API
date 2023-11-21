const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, Trimmed: true },
  email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },
  thoughts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'thought' }],
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }]
});

const user = mongoose.model('user', userSchema);

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
            { username: 'Testing', email: 'testing@test.com' },
            { username: 'Stevio', email: 'Stevio@email.com' },
            { username: 'Watsoin', email: 'watsoin@email.com' },
            { username: 'Swagger', email: 'swagger@email.com' },
            { username: 'PeterParker', email: 'peterp@email.com' },
            { username: 'HulkHogan', email: 'HH@email.com' },
            { username: 'idk', email: 'idk@email.com' },
          ]
        )
        .catch(err => handleError(err));
    }
  });

module.exports = user;