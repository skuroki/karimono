const admin = require('firebase-admin');
const functions = require('firebase-functions');

admin.initializeApp(functions.config().firebase);
var db = admin.firestore();

let fetch = require('node-fetch');

function sendToSlack(url, message) {
  return fetch(url, { method: 'POST', headers: { "Content-Type": "application/json" }, body: JSON.stringify({ response_type: "in_channel", text: message }) });
}

exports.karimono = functions.https.onRequest((request, response) => {
  console.log(JSON.stringify(request.body));
  var count = db.collection('karimono').doc('count');
  count.get().then(doc => {
    if (!doc.exists) {
      return 0;
    } else {
      return doc.data().count + 1;
    }
  }).then(num => {
    var body = 'karimono! ' + num.toString();
    console.log('response_body: ' + body);
    sendToSlack(request.body.response_url, body)
    return
  }).then(() => { return }).catch(() => { return });
  return response.sendStatus(200);
});

console.log('ready');
