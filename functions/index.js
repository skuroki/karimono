const admin = require('firebase-admin');
const functions = require('firebase-functions');

admin.initializeApp(functions.config().firebase);
var db = admin.firestore();

let fetch = require('node-fetch');

function sendToSlack(url, message) {
  return fetch(url, { method: 'POST', headers: { "Content-Type": "application/json" }, body: JSON.stringify({ response_type: "in_channel", text: message }) });
}

var karimonoCollection = db.collection('karimono');

exports.karimono = functions.https.onRequest((request, response) => {
  console.log(JSON.stringify(request.body));
  var command = request.body.text.split(' ')
  console.log(command);
  switch (command[0]) {
    case 'add':
      if (command.length < 2) {
        return response.status(200).send('TODO: write usage');
      } else {
        var name = command[1];
        karimonoCollection.doc(name).set({});
        return response.sendStatus(200);
      }
    case 'list':
      return karimonoCollection.get().then(snapshot => {
        var body = '';
        snapshot.forEach(doc => {
          body += doc.id + ' ';
        });
        console.log(body);
        return response.send(body);
      });
    case 'count':
      var count = karimonoCollection.doc('count');
      count.get().then(doc => {
        if (!doc.exists) {
          return 0;
        } else {
          return doc.data().count + 1;
        }
      }).then(num => {
        karimonoCollection.doc('count').set({count: num});
        var body = 'karimono! ' + num.toString();
        console.log('response_body: ' + body);
        sendToSlack(request.body.response_url, body)
        return
      }).then(() => { return }).catch(() => { return });
      return response.sendStatus(200);
    default:
      return response.status(200).send('TODO: write help');
  }
});

console.log('ready');
