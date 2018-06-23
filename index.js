function doPost(e) {
  console.log(JSON.stringify(e));
  var scriptProperties = PropertiesService.getScriptProperties();

  var command = e.parameter.text.split(' ')
  switch (command[0]) {
    case 'add':
      if (command.length < 2) {
        return ContentService
          .createTextOutput('TODO: write usage');
      } else {
        var name = command[1];
        scriptProperties.setProperty('name', '{}');
        return ContentService
          .createTextOutput('');
      }
    case 'list':
      var body = '';
      scriptProperties.getKeys().forEach(name => {
        body += name + ' ';
      });
      return ContentService
        .createTextOutput(body);
    case 'count':
      var countString = scriptProperties.getProperty('COUNT');
      var count = 0;
      if (countString) {
        count = parseInt(countString);
      }
      count = count + 1;
      scriptProperties.setProperty('COUNT', count);

      return ContentService
        .createTextOutput(JSON.stringify({ response_type: "in_channel", text: "Hello this is karimono " + count.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
    case 'silent':
      return ContentService
        .createTextOutput('');
    default:
      return ContentService
        .createTextOutput('TODO: write help');
  }
}
