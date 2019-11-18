
const fetch = require('node-fetch');
const fs = require("fs");
const scrape = require('url-metadata');
const cheerio = require('cheerio');

const { apiURL, apiSistrix } = require('./src/constants');
const SistrixClass = require('./src/controllers/Sistrix');
const Sistrix = new SistrixClass(apiSistrix, 'domain.sichtbarkeitsindex');

/**
 * Lectura del listado de url y obtención de los datos de la url.
 */
fs.readFile('./input/urls.txt', "utf-8", (err, data) => {
  const urls = data.toString().replace(/\n/g, '').split('\r')
  const dateGet = new Date;
  date = `${dateGet.getFullYear()}-${dateGet.getMonth() + 1}-${dateGet.getDate()}`
  urls.map(e => {
    //* Recoger datos de la url a monitorizar
    fetch(e, { method: 'GET', redirect: 'follow' })
      .then(async res => {
        const p = { p: [] }
        const h = { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] }
        await res.text().then(body => {
          const $ = cheerio.load(body, { decodeEntities: false })
          Array.from($('h1, h2, h3, h4, h5, h6, p')).map((e, i) => {
            const tagName = $(e)[0].name;
            if (tagName === 'p' && $(e).html().length > 0) {
              p['p'].push($(e).html().replace(/\n/g, '').replace(/\r/g, ''))
            } else {
              if ($(e).html().length > 0) {
                h[tagName].push($(e).html().replace(/\n/g, '').replace(/\r/g, ''))
              }
            }
          })
        })

        return scrape(e)
          .then((metadata) => {
            return `{"url": "${e}","interaction": [{"url": "${res.url}","ok": "${res.ok}","statusCode": "${res.status}","canonical": "${metadata.canonical || null}","autoCanonical": "${metadata.canonical === e ? true : false || null}","title": "${metadata.title || null}","description": "${metadata.description || null}","googlebot": "${metadata.googlebot || null}", "VI": "${'0'}", "h": ${JSON.stringify(h)}, "p": ${JSON.stringify(p)},"date": "${date}"}]}`
          })
          .catch(error => {
            return `{"url": "${e}","interaction": [{"url": "${res.url}","ok": "${res.ok}","statusCode": "${res.status}","canonical": "${null}","autoCanonical": "${null}","title": "${null}","description": "${null}","googlebot": "${null}", "VI": "${'0'}", "h": ${JSON.stringify(h)}, "p": ${JSON.stringify(p)},"date": "${date}"}]}`
          })
      })
      .then(data => {
        const idUrl = e.replace(/\//g, '.')
        //* Comprobación si la url ya existe.
        fetch(`${apiURL}/id/${idUrl}`).then(res => res.json())
          .then(async ok => {
            if (!ok) { // Si la url no estaba registrada se hace un POST (Registro)
              // Llamada a la api de SISTRIX
              data = JSON.parse(data)
              data.interaction[0].VI = await Sistrix.visibilityIndex(e);

              fetch(`${apiURL}/`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } })
                .then(res => res.json())
                .then(res => console.log(res.changes))
            } else { // Si la url estaba registrada se hace un PUT (Update)
              data = JSON.parse(data)
              /**
               * Llamada a la api de SISTRIX y comprueba que sea DOMINGO
               * si no es domingo simplemente reescribe el dato anterior 
               */
              // data.interaction[0].VI = (dateGet.getDay()) == 0 ?
              //   await Sistrix.visibilityIndex(e) :
              //   ok.interaction[ok.interaction.length - 1].VI;

              fetch(`${apiURL}/id/${idUrl}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } })
                .then(res => res.json())
                .then(res => console.log(res.changes))
            }
          })
      })
  })
})
