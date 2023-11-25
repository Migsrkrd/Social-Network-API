const router = require("express").Router();
const { user, thought } = require("../../models");

// GET all users
router.get("/", (req, res) => {
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
      console.log("hello");
    });
});

// GET a single user by its _id and populated thought and friend data
router.get("/:id", (req, res) => {
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
router.post("/", (req, res) => {
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
router.put("/:id", (req, res) => {
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
router.delete("/:id", (req, res) => {
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
router.post("/:userId/friends/:friendId", (req, res) => {
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
router.delete("/:userId/friends/:friendId", (req, res) => {
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

module.exports = router;
