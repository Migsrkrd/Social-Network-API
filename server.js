const express = require("express");
const db = require("./config/connection");
// Require model
const { user, thought, reaction } = require("./models");

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// GET all users
app.get("/api/users", (req, res) => {
  user
    .find({})
    .populate({
      path: "thoughts",
      select: "-__v",
    })
    .populate({
      path: "friends",
      select: "-__v",
    })
    .select("-__v")
    .then((dbUserData) => res.json(dbUserData))
    .catch((err) => {
      console.error(err);
      res.sendStatus(400);
    });
});

// GET a single user by its _id and populated thought and friend data
app.get("/api/users/:id", (req, res) => {
  user
    .findOne({ _id: req.params.id })
    .populate({
      path: "thoughts",
      select: "-__v",
    })
    .populate({
      path: "friends",
      select: "-__v",
    })
    .select("-__v")
    .then((dbUserData) => {
      if (!dbUserData) {
        res.status(404).json({ message: "No user found with this id!" });
        return;
      }
      res.json(dbUserData);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(400);
    });
});

// POST a new user:
app.post("/api/users", (req, res) => {
  user
    .create({
      username: req.body.username,
      email: req.body.email,
    })
    .then((dbUserData) => res.json(dbUserData))
    .catch((err) => {
      console.error(err);
      res.sendStatus(400);
    });
});

// PUT to update a user by its _id
app.put("/api/users/:id", (req, res) => {
  user
    .findOneAndUpdate(
      { _id: req.params.id },
      { $set: req.body },
      { runValidators: true, new: true }
    )
    .then((dbUserData) => {
      if (!dbUserData) {
        res.status(404).json({ message: "No user found with this id!" });
        return;
      }
      res.json(dbUserData);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(400);
    });
});

// DELETE a user by its _id
app.delete("/api/users/:id", (req, res) => {
  user
    .findOneAndDelete({ _id: req.params.id })
    .then((deletedUser) => {
      if (!deletedUser) {
        res.status(404).json({ message: "No user found with this id!" });
        return;
      }
      return thought.deleteMany({ _id: { $in: deletedUser.thoughts } });
    })
    .then(() => {
      res.json({ message: "User and associated thoughts deleted!" });
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(400);
    });
});

// POST to add a new friend to a user's friend list
app.post("/api/users/:userId/friends/:friendId", (req, res) => {
  user
    .findOneAndUpdate(
      { _id: req.params.userId },
      { $addToSet: { friends: req.params.friendId } },
      { runValidators: true, new: true }
    )
    .then((dbUserData) => {
      if (!dbUserData) {
        res.status(404).json({ message: "No user found with this id!" });
        return;
      }
      return user.findOneAndUpdate(
        { _id: req.params.friendId },
        { $addToSet: { friends: req.params.userId } },
        { runValidators: true, new: true }
      );
    })
    .then((dbUserData) => {
      if (!dbUserData) {
        res.status(404).json({ message: "No friend found with this id!" });
        return;
      }
      res.json(dbUserData);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(400);
    });
});

// DELETE to remove a friend from a user's friend list
app.delete("/api/users/:userId/friends/:friendId", (req, res) => {
  user
    .findOneAndUpdate(
      { _id: req.params.userId },
      { $pull: { friends: req.params.friendId } },
      { runValidators: true, new: true }
    )
    .then((dbUserData) => {
      if (!dbUserData) {
        res.status(404).json({ message: "No user found with this id!" });
        return;
      }
      return user.findOneAndUpdate(
        { _id: req.params.friendId },
        { $pull: { friends: req.params.userId } },
        { runValidators: true, new: true }
      );
    })
    .then((dbUserData) => {
      if (!dbUserData) {
        res.status(404).json({ message: "No friend found with this id!" });
        return;
      }
      res.json(dbUserData);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(400);
    });
});

// GET all thoughts
app.get("/api/thoughts", (req, res) => {
  thought
    .find({})
    .populate({
      path: "reactions",
      select: "-__v",
    })
    .select("-__v")
    .then((dbThoughtData) => res.json(dbThoughtData))
    .catch((err) => {
      console.error(err);
      res.sendStatus(400);
    });
});

// GET a single thought by its _id
app.get("/api/thoughts/:id", (req, res) => {
  thought
    .findOne({ _id: req.params.id })
    .populate({
      path: "reactions",
      select: "-__v",
    })
    .select("-__v")
    .then((dbThoughtData) => {
      if (!dbThoughtData) {
        res.status(404).json({ message: "No thought found with this id!" });
        return;
      }
      res.json(dbThoughtData);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(400);
    });
});

// POST to create a new thought (don't forget to push the created thought's _id to the associated user's thoughts array field)
app.post("/api/thoughts", (req, res) => {
  thought
    .create(req.body)
    .then((dbThoughtData) => {
      return user.findOneAndUpdate(
        { _id: req.body.userId },
        { $push: { thoughts: dbThoughtData._id } },
        { runValidators: true, new: true }
      );
    })
    .then((dbUserData) => {
      if (!dbUserData) {
        res.status(404).json({ message: "No user found with this id!" });
        return;
      }
      res.json(dbUserData);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(400);
    });
});

// PUT to update a thought by its _id
app.put("/api/thoughts/:id", (req, res) => {
    thought
        .findOneAndUpdate({ _id: req.params.id }, { $set: req.body }, { runValidators: true, new: true })
        .then(dbThoughtData => {
            if (!dbThoughtData) {
            res.status(404).json({ message: 'No thought found with this id!' });
            return;
            }
            res.json(dbThoughtData);
        })
        .catch(err => {
            console.error(err);
            res.sendStatus(400);
        });
}
);

// DELETE to remove a thought by its _id
app.delete("/api/thoughts/:id", (req, res) => {
  thought
    .findOneAndDelete({ _id: req.params.id })
    .then((deletedThought) => {
      if (!deletedThought) {
        res.status(404).json({ message: "No thought found with this id!" });
        return;
      }
      return user.findOneAndUpdate(
        { thoughts: req.params.id },
        { $pull: { thoughts: req.params.id } },
        { runValidators: true, new: true }
      );
    })
    .then(() => {
      res.json({ message: "Thought and associated reactions deleted!" });
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(400);
    });
});

// POST to create a reaction stored in a single thought's reactions array field
app.post("/api/thoughts/:thoughtId/reactions", (req, res) => {
  thought
    .findOneAndUpdate(
      { _id: req.params.thoughtId },
      { $push: { reactions: req.body } },
      { runValidators: true, new: true }
    )
    .then((dbThoughtData) => {
      if (!dbThoughtData) {
        res.status(404).json({ message: "No thought found with this id!" });
        return;
      }
      res.json(dbThoughtData);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(400);
    });
});

// DELETE to pull and remove a reaction by the reaction's reactionId value
app.delete("/api/thoughts/:thoughtId/reactions/:reactionId", (req, res) => {
  thought
    .findOneAndUpdate(
      { _id: req.params.thoughtId },
      { $pull: { reactions: { reactionId: req.params.reactionId } } },
      { runValidators: true, new: true }
    )
    .then((dbThoughtData) => {
      if (!dbThoughtData) {
        res.status(404).json({ message: "No thought found with this id!" });
        return;
      }
      res.json({ message: "Reaction deleted!" });
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(400);
    });
});



db.once("open", () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
  });
});
