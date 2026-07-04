const express = require('express');
const app = express();
const router = express.Router();
router.get('/*key', (req, res) => {
  res.send({ key: req.params.key || req.params[0] });
});
app.use('/media', router);
app.listen(3001, () => console.log('started'));
