var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.json({
    name:"kripa",
    college: "Islington college",
    tech:["JavaScript", "Express", "React"]
  })
});

module.exports = router;
