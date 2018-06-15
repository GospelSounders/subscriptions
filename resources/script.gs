function onEdit(e)
{ 
  var thisrow = e.range.getRow();
  var attachment = SpreadsheetApp.getActiveSheet().getRange(thisrow, 1).getValue();
  var subject = SpreadsheetApp.getActiveSheet().getRange(thisrow, 2).getValue();
  var content = SpreadsheetApp.getActiveSheet().getRange(thisrow, 3).getValue();
  var tosend = SpreadsheetApp.getActiveSheet().getRange(thisrow, 4).getValue();
  
  if(tosend !== 1)return
//  var url = SpreadsheetApp.getActiveSheet().getRange(thisrow, 5).getValue();
  
  var emailtoSend = {};
  emailtoSend['subject'] = subject;
  emailtoSend['content'] = content;
  emailtoSend = encodeURIComponent(JSON.stringify(emailtoSend));
  emailtoSend = 'http://gospelsounders.org/sendemails/email/'+emailtoSend+'/'+attachment;
  
  var cellFunction = '=importxml("'+emailtoSend+'","//@q")';
  SpreadsheetApp.getActiveSheet().getRange(thisrow, 5).setValue(cellFunction);
  
  SpreadsheetApp.getActiveSheet().getRange(thisrow, 4).setValue(0);
  
}