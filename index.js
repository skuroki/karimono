let scriptProperties = PropertiesService.getScriptProperties();

function doPost(e) {
  console.log(JSON.stringify(e.parameter));

  let command = e.parameter.text.split(' ');
  let response = executeCommand(
    command,
    e.parameter.user_id,
    e.parameter.channel_id);

  return ContentService
    .createTextOutput(JSON.stringify({
      response_type: 'in_channel',
      text: response }))
    .setMimeType(ContentService.MimeType.JSON);
}

const usage = '追加する時は `/karimono add 追加するもの`\n' +
  '削除する時は `/karimono delete 削除するもの`\n' +
  '検索する時は `/karimono list 検索ワード（何個でもOK、なしでもOK）`\n' +
  '借りたい時は `/karimono kariru 借りたいもの `\n' +
  '返却する時は `/karimono kaesu 返却するもの`';


function executeCommand(command, userId, channelId) {
  switch (command[0]) {
    case 'add':
      if (command.length < 2) {
        return usage;
      } else {
        let name = command[1];
        return executeAdd(name, channelId);
      }
    case 'delete':
      if (command.length < 2) {
        return usage;
      } else {
        let name = command[1];
        return executeDelete(name, channelId);
      }
    case 'list':
      return executeList(command.slice(1), channelId);
    case 'kariru':
      {
        let name = command[1];
        return executeBorrow(name, userId, channelId);
      }
    case 'kaesu':
      {
        let name = command[1];
        return executeReturn(name, userId, channelId);
      }
    default:
      return usage;
  }
}

function executeAdd(name, channelId) {
  let property = scriptProperties.getProperty(channelId + '/' + name);
  if (property) {
    return name + 'は既に登録されています';
  } else {
    scriptProperties.setProperty(channelId + '/' + name, '{}');
    return name + 'を登録しました';
  }
}

function executeDelete(name, channelId) {
  let property = scriptProperties.getProperty(channelId + '/' + name);
  if (property) {
    scriptProperties.deleteProperty(channelId + '/' + name);
    return name + 'を削除しました';
  } else {
    return name + 'は登録されていません';
  }
}

function executeList(words, channelId) {
  let body = '';
  scriptProperties.getKeys().filter(fullName => {
    return fullName.indexOf(channelId) == 0;
  }).filter(fullName => {
    let name = fullName.slice(fullName.indexOf('/') + 1);
    return words.every(w => {
      return name.indexOf(w) > -1;
    });
  }).forEach(fullName => {
    let name = fullName.slice(fullName.indexOf('/') + 1);
    let listItem = name;
    let item = JSON.parse(scriptProperties.getProperty(fullName));
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

function executeBorrow(name, userId, channelId) {
  let property = scriptProperties.getProperty(channelId + '/' + name);
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
        scriptProperties.setProperty(
          channelId + '/' + name, JSON.stringify(item));
        response += ' 返却されたらお知らせします';
      }
      return response;
    } else {
      item.borrower = userId;
      scriptProperties.setProperty(
        channelId + '/' + name, JSON.stringify(item));
      return name + 'を<@' + userId + '>に貸し出します';
    }
  } else {
    return name + 'は登録されていません';
  }
}

function executeReturn(name, userId, channelId) {
  let property = scriptProperties.getProperty(channelId + '/' + name);
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
        scriptProperties.setProperty(
          channelId + '/' + name, JSON.stringify(item));
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
