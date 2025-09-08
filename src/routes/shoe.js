const router = require("express").Router();
const ctrl = require("../controllers/shoes");

router.get("/", ctrl.list);
router.post("/", ctrl.create);

module.exports = router;

// to add more routes (update, delete, getById)
