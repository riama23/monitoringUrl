var nodemailer = require('nodemailer');
// email sender function
exports.sendEmail = function (req, res, asunto, msg) {
  // Definimos el transporter
  var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'EMAIL',
      pass: 'CONTARSEÑA'
    }
  });
  // Definimos el email
  var mailOptions = {
    from: 'EMAIL',
    to: 'daniel.moreno@habitant.es',
    subject: asunto,
    html: `${msg}`
  };
  // Enviamos el email
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      res.send(500, err.message);
    } else {
      console.log("Email sent");
      res.status(200).jsonp(req.body);
    }
  });
};