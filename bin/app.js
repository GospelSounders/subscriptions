/**
 * Module dependencies.
 */
const express = require('express');
const path = require('path');
const fse = require('fs-extra');
const Async = require('async');
const dotenv = require('dotenv');
const logger = require('morgan');
const bodyParser = require('body-parser');
const chalk = require('chalk');
const shell = require('shelljs');

if (fse.existsSync('.env'))
  dotenv.load({ path: '.env' });
else
  dotenv.load({ path: '.env.example' });

/**
 * Create Express server.
 */
 const app = express();
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../views'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public', { maxAge: 31557600000 }));
app.use(express.static('uploads'));

/*
 *  receive somethings....
 */

app.get('/email/:emaildata/:attachment?/', function (req, res) { //attachment is the filename
  let email = req.params.emaildata;
  let attachment = req.params.attachment;

  email = decodeURIComponent(email)
  // attachment = decodeURIComponent(attachment)

  fse.writeFile(`emails/${attachment}`, email, function(err) {
      if(err) {
          return console.log(err);
      }
      let cmd = `sh sendEmail.sh '${attachment}' &`
      console.log(`cmd: ${cmd}`)
      // console.log(cmd);
      let child = shell.exec(cmd, {async:true, silent:true});
      child.stdout.on('data', function(data) {
          console.log(data)
        });
  });
  console.log(email)
  console.log(attachment)

  //run a different file here

  //save the emaildata into a file having the same name 

  //enterd after

  // var mysql      = require('mysql');
  // var connection = mysql.createConnection({
  //   host     : process.env.HOST,
  //   user     : process.env.USERNAME,
  //   password : process.env.PASSWORD,
  //   database : process.env.DATABASE,
  // });


  // connection.connect();

  // connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
  //   if (error) throw error;
  //   console.log('The solution is: ', results[0].solution);
  // });

  // connection.end();
  // data = decodeURIComponent(data)

  // try{
  //   JSON.parse(data)
  //   fse.writeFile("hymnals-data/index.json", data, function(err) {
  //     if(err) {
  //         return console.log(err);
  //     }
  //     let cmd = `sh hymnals-data/hymnalupdates.sh update`
  //     // console.log(cmd);
  //     let child = shell.exec(cmd, {async:true, silent:true});
  //     child.stdout.on('data', function(data) {
  //         console.log(data)
  //       });
  //   });
  //   res.send('...')
  // }catch(err){
  //   res.send(err+'.')
  // }
  res.send('>>>>')
  
})



/**
 * 404
 */
app.route('*')
.get( function(req, res){
  res.status(404).send('404')
  //res.render('404');
})
.post( function(req, res){
  res.status(404).send('404')
});

/**
 * Error Handler
 */
app.use(function(err, req, res, next) {
  res.status(500).send('500')
});

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env')); 
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;