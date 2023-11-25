const router = require("express").Router();
const { user, thought, reaction} = require("../../models");


router.get("/", (req, res) => {
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
router.get("/:id", (req, res) => {
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
router.post("/", (req, res) => {
  thought
    .create({
      thoughtText: req.body.thoughtText,
      username: req.body.username,
    })
    .then((dbThoughtData) => {
      console.log(dbThoughtData);
      return user.findOneAndUpdate(
        { _id: req.body.userId },
        { $push: { thoughts: dbThoughtData} },
        { runValidators: true, new: true }
      );
    })
    .then((dbUserData) => {
      if (!dbUserData) {
        res.status(404).json({ message: "No user found with this username!" });
        return;
      }
      res.json(dbUserData);
    })
    .catch((err) => {
      console.error(err);
      res.status(400).json(err);
    });
});


// PUT to update a thought by its _id
router.put("/:id", (req, res) => {
  thought
    .findOneAndUpdate(
      { _id: req.params.id },
      { $set: req.body },
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

// DELETE to remove a thought by its _id
router.delete("/:id", (req, res) => {
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
      res.json({ message: "Thought deleted!" });
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(400);
    });
});

router.post("/:thoughtId/reactions", (req, res) => {
reaction
  .create(req.body)
  .then((dbReactionData) => {
    return thought.findOneAndUpdate(
      { _id: req.params.thoughtId },
      { $push: { reactions: dbReactionData } },
      { runValidators: true, new: true }
    );
  })
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
router.delete("/:thoughtId/reactions/:reactionId", (req, res) => {
reaction
  .findOneAndDelete({ _id: req.params.reactionId })
  .then((deletedReaction) => {
    if (!deletedReaction) {
      res.status(404).json({ message: "No reaction found with this id!" });
      return;
    }
    return thought.findOneAndUpdate(
      { _id: req.params.thoughtId },
      { $pull: { reactions: req.params.reactionId } },
      { runValidators: true, new: true }
    );
  })
  .then(() => {
    res.json({ message: "Reaction deleted!" });
  })
  .catch((err) => {
    console.error(err);
    res.sendStatus(400);
  });
});

module.exports = router;
