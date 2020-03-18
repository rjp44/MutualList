const express = require('express');
const morgan = require('morgan');
const { console } = require('../lib/logJson.js');

const package = require('../package.json');
const config = require('../config.js');

// TODO add a swagger API def
//const { DocServe, DocSetup } = require('./lib/swagger.js');

const server = require('./server.js');

const GeoCode = require('./geo_code.js');

const apiVersion = Dialog.apiVersion();

const yargs = require('yargs');

const app = express();
const api = express();

app.use('/docs', DocServe);
app.get('/docs', DocSetup);

app.use(`/rest/v${apiVersion}`, api);
api.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
api.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Total-Count, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header("Access-Control-Expose-Headers", "X-Total-Count");
  next();
});
api.use(express.json());
api.all(`/location?`, server.authenticate, server.agent);
// TODO Add individual offer/client/group search like this...
//api.all(`/volunteer/:index(latlong|postcode|locname)/:radius?`, server.authenticate, server.dialog);
//api.all(`/client/:index(latlong|postcode|locname)/:radius?`, server.authenticate, server.dialog);
//api.all(`/group/:index(latlong|postcode|locname)/:radius?`, server.authenticate, server.dialog);


api.use((err, req, res, next) => {
  console.log('Express errror', err);
  res.on('finish', function () {
    console.log('status: ', this.statusCode)
    if (this.statusCode >= 400)
      console.log('API Error: ', res);
  })
  next(err);
})

api.get('*', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.status(404)
    .send(JSON.stringify({ error: 'path unknown' }));
});

yargs.command('convert text', 'Convert a placename to a geo-pin', (yargs) => {
    yargs.positional('text', {
      describe: 'text to be converted',
      default: config.defaultName
    });
  }, (argv) => {
    console.info(`convert ${argv.text}`)
    geoCode(text).then(location => {
      console.info (`converted ${argv.text} to ${location}`);
      process.exit(1);
    });

  })
  .command('serve [file]', 'Run geocode service based on file', (yargs) => {
  }, (argv) => {
    console.info(`Starting server using dialogs from ${argv.names}`)
    const geoCode = new GeoCode(argv.file);
    if (require.main === module) {
      app.listen(8081);
    }
  })
  .option('names', {
    alias: 'f',
    describe: 'location data mapping file',
    default: config.namesFile
  })
  .argv

const PORT = process.env.PORT || 8081;

if (require.main === module && (!yargs.argv || !yargs.argv._ || yargs.argv._[0] !== "serve")) {
  const geoCode = new GeoCode(config.names);
  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
  });
}

exports = module.exports = app;
