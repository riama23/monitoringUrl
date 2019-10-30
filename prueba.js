const fetch = require('node-fetch');
const cheerio = require('cheerio');

const obj = {
  h: {
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: []
  },
  p: []
}

fetch('https://www.einforma.com').then(res => res.text())
  .then(body => {
    const $ = cheerio.load(body, { decodeEntities: false })
    Array.from($('h1, h2, h3, h4, h5, h6, p')).map((e, i) => {
      const tagName = $(e)[0].name;
      if (tagName === 'p') {
        obj.p.push($(e).html())
      } else {
        obj.h[tagName].push($(e).html())
        console.log(i)
      }
    })
  })
  .then(() => console.log(`Etiquetas <p>: ${obj.p.length}\nEtiquetas <hX>: ${obj.h['h1'].length+obj.h['h2'].length+obj.h['h3'].length+obj.h['h4'].length+obj.h['h5'].length+obj.h['h6'].length}`))