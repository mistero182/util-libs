import AWS from 'aws-sdk'
import nodemailer from 'nodemailer'

//  -----    Commit in AWS Serverless
const credentials = new AWS.SharedIniFileCredentials({profile: 'ssi-account'})
AWS.config.credentials = credentials
AWS.config.update({region: 'us-east-1'})


const ses = new AWS.SES({ region: "us-east-1" })


export const sesSendEmail = async (params) => {
  const { to, from, subject, html, cc, attachments } = params
    
  const mailOptions = {
      from,
      subject,
      html,
      to,
      cc: cc ? cc : undefined,
      attachments: attachments ? attachments : undefined,
  };
  
  const transporter = nodemailer.createTransport({
    SES: ses
  });


  // send email
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
          console.log(err);
          console.log('Error sending email');
          //callback(err);
          reject(err)
      } else {
          console.log('Email sent successfully');
          //callback();
          resolve('Email sent successfully')
      }
    });
  })
}