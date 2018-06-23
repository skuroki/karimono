let scriptProperties = PropertiesService.getScriptProperties();

function doPost(e) {
  console.log(JSON.stringify(e));

  let command = e.parameter.text.split(' ');
  let response = executeCommand(command, e.parameter.user_id);

  return ContentService
    .createTextOutput(JSON.stringify({
      response_type: 'in_channel',
      text: response }))
    .setMimeType(ContentService.MimeType.JSON);
}

function executeCommand(command, userId) {
  switch (command[0]) {
    case 'add':
      if (command.length < 2) {
        return 'TODO: write usage';
      } else {
        let name = command[1];
        return executeAdd(name);
      }
    case 'delete':
      if (command.length < 2) {
        return 'TODO: write usage';
      } else {
        let name = command[1];
        return executeDelete(name);
      }
    case 'list':
      return executeList(command.slice(1));
    case 'kariru':
      {
        let name = command[1];
        return executeBorrow(name, userId);
      }
    case 'kaesu':
      {
        let name = command[1];
        return executeReturn(name, userId);
      }
    default:
      return 'TODO: write help';
  }
}

function executeAdd(name) {
  let property = scriptProperties.getProperty(name);
  if (property) {
    return name + 'は既に登録されています';
  } else {
    scriptProperties.setProperty(name, '{}');
    return name + 'を登録しました';
  }
}

function executeDelete(name) {
  let property = scriptProperties.getProperty(name);
  if (property) {
    scriptProperties.deleteProperty(name);
    return name + 'を削除しました';
  } else {
    return name + 'は登録されていません';
  }
}

function executeList(words) {
  let body = '';
  scriptProperties.getKeys().filter(name => {
    return words.every(w => {
      return name.indexOf(w) > -1;
    });
  }).forEach(name => {
    let listItem = name;
    let item = JSON.parse(scriptProperties.getProperty(name));
    if (item.borrower) {
      listItem += ' <@' + item.borrower + '>に貸出中';
    }
    if (item.waiting) {
      listItem += ' <@' + item.waiting + '>が返却待ち';
    }
    body += listItem + '\n';
  });
  return body;
}

function executeBorrow(name, userId) {
  let property = scriptProperties.getProperty(name);
  if (property) {
    let item = JSON.parse(property);
    let borrower = item.borrower;
    if (borrower) {
      let response = name + 'は<@' + borrower + '>に貸出中です';
      let waiting = item.waiting;
      if (waiting) {
        response += ' <@' + waiting + '>が返却を待っています';
      } else {
        item.waiting = userId;
        scriptProperties.setProperty(name, JSON.stringify(item));
        response += ' 返却されたらお知らせします';
      }
      return response;
    } else {
      item.borrower = userId;
      scriptProperties.setProperty(name, JSON.stringify(item));
      return name + 'を<@' + userId + '>に貸し出します';
    }
  } else {
    return name + 'は登録されていません';
  }
}

function executeReturn(name, userId) {
  let property = scriptProperties.getProperty(name);
  if (property) {
    let item = JSON.parse(property);
    let borrower = item.borrower;
    if (borrower) {
      if (borrower == userId) {
        delete item.borrower;
        let response = name + 'の返却を受け付けました';
        let waiting = item.waiting;
        if (waiting) {
          response += '\n\n<@' + waiting + '> 返却されました';
          delete item.waiting;
        }
        scriptProperties.setProperty(name, JSON.stringify(item));
        return response;
      } else {
        return name + 'は<@' + borrower + '>に貸出中です';
      }
    } else {
      return name + 'は貸し出されていません';
    }
  } else {
    return name + 'は登録されていません';
  }
}
