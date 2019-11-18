const express = require('express');
const router = express.Router();

// Urls Model
const Urls = require('../models/urls');

// GET all URLS
router.get('/', async (req, res) => {
  const int = await Urls.find();
  res.json(int);
});

// GET one URL
router.get('/id/:id', async (req, res) => {
  const int = await Urls.findById(req.params.id);
  res.json(int);
});

// GET one URL and one DAY
router.get('/id/:id/date/:date', async (req, res) => {
  const int = await Urls.find({ _id: req.params.id });
  const index = int[0].interaction.findIndex(e => e.date == req.params.date)
  res.json(int[0].interaction[index]);
});
// GET one URL and DAY to DAY
router.get('/id/:id/date/:dateI/:dateF', async (req, res) => {
  const int = await Urls.find({ _id: req.params.id });
  const index = int[0].interaction.findIndex(e => e.date == req.params.dateI)
  const indexF = int[0].interaction.findIndex(e => e.date == req.params.dateF)
  res.json(int[0].interaction.slice(index, indexF+1));
});

// ADD a new URL
router.post('/', async (req, res) => {
  const { url, interaction, changes } = req.body;
  const int = new Urls({ _id: url.replace(/\//g, '.'), url, interaction, changes: [true] });
  await int.save();
  res.json(int)
});

// UPDATE a new URL
router.put('/id/:id', async (req, res) => {
  const int = await Urls.findById(req.params.id);
  let { url, interaction } = req.body;
  await int.interaction.push(interaction[0])
  // Comprobación de datos
  const er = new RegExp(/"date":"20[0-9][0-9]-[0-9][0-9]-[0-9][0-9]"/, 'g')
  await JSON.stringify(int.interaction[int.interaction.length - 1]).replace(er, '') === JSON.stringify(int.interaction[int.interaction.length - 2]).replace(er, '') ?
    int.changes.push(false) : int.changes.push(true)

  let changes = int.changes
  interaction = int.interaction

  await Urls.findByIdAndUpdate(req.params.id, { url, interaction, changes });
  res.json(int);
});

module.exports = router;