console.log('reached')
const path = require('path');
const fse = require('fs-extra');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
var mysql      = require('mysql');

// const fs = require('fs');

if (fse.existsSync('.env'))
  dotenv.load({ path: '.env' });
else
  dotenv.load({ path: '.env.example' });


let filename = [];
process.argv.forEach(function (val, index, array) {
  // console.log(index + ': ' + val);
  if(index >=2 )filename.push(val)
});


filename = filename.join(' ');
console.log(`Email file: ${filename}`)

console.log('reached')


let emails = [];
emails.push('surgbc@gmail.com');


console.log('opening file...')

fse.readFile(`emails/${filename}`, 'utf8', function(err, data) {
  if (err) {
  	console.log(err);
  	throw err
  };
  console.log('OK: ' + filename);
  data = decodeURIComponent(data)

  console.log(data)

  // email = 'surgbc@gmail.com'
  data = JSON.parse(data);
  data.content = data.content.replace(/(?:\r\n|\r|\n)/g, '<br>');

  let email = emails[0]

  // loop through 

  var connection = mysql.createConnection({
    host     : process.env.HOST,
    user     : process.env.USERNAME,
    password : process.env.PASSWORD,
    database : process.env.DATABASE,
  });


  connection.connect();
  let rows

  console.log("passed rows")
  try{

  function firstQuery(){
	connection.query('SELECT Email From subscriptions WHERE 1', function (error, results, fields) {
		if (error) {
			connection.end();
			throw error;
		}
		rows = results.length
		// let tmpresults = {Email: 'surgbc@gmail.com'}
		secondQuery(0, results,function(){
		// secondQuery(0, tmpresults,function(){
			console.log('ending query')
			connection.end();
		})
	});
  }

  function secondQuery(count, emails, callback){
  	rows = emails.length
  	let email = emails[count].Email
  	connection.query(`SELECT Email From SentEmails WHERE Email='${email}' AND WhichFile='${filename}'`, function (error, resultsi, fields) {
			if (error) {
				if (count !== rows){
					count++;
					secondQuery(++count, emails, callback)
				} else callback();
			}else {
				if (count !== rows){
					// console.log(`will send to ${email} for ${count} of ${rows}`)
					// console.log(resultsi)
					// count++;
					if(resultsi.length === 0)
					sendEmail(email, data, '"Gospel Sounders" <editor@gospelsounders.org>', filename, function(){
						secondQuery(++count, emails, callback)
					})
					else {
						console.log(`Will not send because has been sent to ${email}`)
						secondQuery(++count, emails, callback)
					}
					
				}else callback();
				
			}
			// console.log(resultsi)
		});
		
  }
  console.log("passed rows1..........")
  firstQuery();
}catch(err){
	console.log(err)
}

  // console.log(rows)
  // connection.end();

  //sendEmail(email, data, '"Gospel Sounders" <editor@gospelsounders.org>', filename)

var sendEmail = function(address, data, sender, filename, callback) {
	nodemailer.createTestAccount((err, account) => {
	    let transporter = nodemailer.createTransport({
	        host: process.env.MAILSERVER,
	        port: 587,
	        secure: false, // true for 465, false for other ports
	        auth: {
	            user: process.env.DEFAULTEMAIL,
	            pass: process.env.EMAILPASSWORD
	        }
	    });

	    let path = `uploads/${filename}`;
	    // console.log(path)
	    let mailOptions = {}
	    try{
	    mailOptions = {
	        from: sender,
	        to: address, 
	        subject: data.subject, 
	        html: data.content, // html body
	        attachments: [
	        {
	        	filename: `${filename}`,
	        	path: path,
	            content: filename
	        }
	        ]
	    };
		}catch(er){console.log(er)}

		
		// // console.log(mailOptions)
		// if(address === 'surgbc@gmail.com')
		// {

			console.log(`SENDING TO ${address}`)
			// 
	    // send mail with defined transport object
		    transporter.sendMail(mailOptions, (error, info) => {
		        if (error) {
		            return callback();
		        }
		        var post  = {Email: address, WhichFile: filename};
		        connection.query('INSERT INTO SentEmails SET ?', post, function (error, results, fields) {
				 	console.log('Message sent: %s', info.messageId);
			        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
			        callback();
				});
		        

		        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
		        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
		    });
		// }else callback();
		

		
	})
}

});



// let emailhtml = 