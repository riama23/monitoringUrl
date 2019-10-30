const dotenv = require('dotenv');
const fetch = require('node-fetch');
dotenv.config();

const Sistrix = class Sistrix {
  constructor(api_key, pointBreak) {
    this.path = `https://api.sistrix.com`,
      this.api_key = api_key,
      this.pointBreak = pointBreak,
      this.pathPoint_ = `${this.path}/${pointBreak}?api_key=${api_key}&format=json&`
  }

  /**
  * @param url Url de la cual se quiere extraer el Índice de Visibilidad
  */
  async visibilityIndex(url) {
    return await fetch(`${this.pathPoint_}url=${url}`)
      .then(req => req.json()).then(VI => VI.answer[0].sichtbarkeitsindex[0].value)
  }
}

module.exports = Sistrix