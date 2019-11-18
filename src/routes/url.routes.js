const express = require('express');
const EmailCtrl = require('../controllers/emailAlert.js');
const router = express.Router();

const schema_data = { "url": true, "ok": true, "statusCode": true, "canonical": true, "autoCanonical": true, "title": true, "description": true, "googlebot": true, "VI": true, "h": { "h1": [], "h2": [], "h3": [], "h4": [], "h5": [], "h6": [] }, "p": { "p": [] } }
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
  res.json(int[0].interaction.slice(index, indexF + 1));
});

// ADD a new URL
router.post('/', async (req, res) => {
  const { url, interaction, changes } = req.body;
  const int = new Urls({ _id: url.replace(/\//g, '.'), url, interaction, changes: schema_data });
  
  // Email de alta url
  const msg = `<p>Le informamos que se ha dado de alta una nueva url: ${url}<p>`
  EmailCtrl.sendEmail('', '', 'Se ha añadido una nueva url', msg)

  await int.save();
  res.json(int)
});

// UPDATE a URL
router.put('/id/:id', async (req, res) => {
  const int = await Urls.findById(req.params.id);
  let { url, interaction } = req.body;
  await int.interaction.push(interaction[0])

  // Comprobación de datos detalle
  const data_actual = int.interaction[int.interaction.length - 1]
  const data_pasada = int.interaction[int.interaction.length - 2]
  const schema_cambios = schema_data
  Object.keys(schema_cambios).map(e => {
    if (typeof (data_actual[e]) === 'object') {
      Object.keys(data_actual[e]).map(j => data_actual[e][j].map((h, _h) => data_actual[e][j][_h] === data_pasada[e][j][_h] ? schema_cambios[e][j].push(false) : schema_cambios[e][j].push(true)))
    } else {
      data_actual[e] === data_pasada[e] ?
        schema_cambios[e] = false : schema_cambios[e] = true
    }
  })
  int.changes.push(schema_cambios)

  const msg = `
    <p>La propiedad que tenga el valor "true" es la que ha modificado su valor respecto a la vez anterior.</p>
    <p>La url que ha cmabiado es: <a href="${data_actual.url}" target="_blank" rel="noopener noreferrer">${data_actual.url}</a></p>
    <h2>Schema de monitorización</h2>
    <p><code>${JSON.stringify(data_actual)}</code></p>
    <h2>Schema de cambios</h2>
    <p><code>${JSON.stringify(schema_cambios)}</code></p>
  `
  JSON.stringify(schema_cambios) === JSON.stringify(int.changes[int.changes.length - 2]) ? console.log('NO CHANGES') : EmailCtrl.sendEmail('', '', 'Una url monitorizada ha cambiado', msg);

  let changes = int.changes
  interaction = int.interaction

  await Urls.findByIdAndUpdate(req.params.id, { url, interaction, changes });
  res.json(int);
});

module.exports = router;