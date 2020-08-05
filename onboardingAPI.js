import "./airtable.browser.js";

var Airtable = require('airtable');
var base = new Airtable({ apiKey: 'ENTER API KEY' }).base('ENTER BASE KEY');

const questions = ["1a", "1b", "1c", "2a", "2b", "2c", "3a", "3b", "3c", "4a", "4b", "4c", "4d", "5a", "5b"];

/**
 * This function returns whether the input is a valid question
 * @param {String} a question
 * @returns {boolean} whether the question is valid
 * @private
 */
function validQuestion(question) {
    return (typeof question === 'string' || question instanceof String) && questions.includes(question);
}

/**
 * This function gets the correct answer to the input question from the database.
 * @param {String} a question
 * @returns {String} the correct answer
 * @private
 */
async function getCorrectAnswer(question) {
    try {
        if (validQuestion(question)) {
            const records = await base('Questions').select({
                filterByFormula: "{question}='" + question + "'",
                maxRecords: 1,
            }).firstPage();
            const record = records[0];
            return record.get('correct_ans');
        }
    } catch (err) {
        console.log(err);
    }
}

/**
 *  This function returns a user's attempts for a question.
 *  @param {String} user email
 *  @param {String} question ID
 *  @returns {number} the number of attempts
 *  @public
 */
async function getAttempts(userEmail, question) {
    try {
        if ((typeof userEmail === 'string' || userEmail instanceof String) && (typeof question === 'number' || question instanceof Number)) {
            const records = await base('Users').select({
                filterByFormula: "{user_email}='" + userEmail + "'",
            }).firstPage();
            const record = records[0];
            return record.get(question + ' attempts');
        }
    } catch (err) {
        console.log(err); 
    }
}

/**
 * This function returns whether the user answer is correct given the question
 * @param {String} a question
 * @param {String} user's answer to the question
 * @returns {boolean} whether the user's answer was correct
 * @public
 */
async function checkAnswer(question, answer) {
    if (validQuestion && (typeof answer === 'string' || answer instanceof String)) {
        return getCorrectAnswer(question).equals(answer);
    }
}

/**
 * This function returns the record ID of a user.
 */
async function getRecordID(userEmail) {
  try {
        if (typeof userEmail === 'string' || userEmail instanceof String) {
              const records = await base('Users').select({
                  filterByFormula: "{user_email}='" + userEmail + "'",
              }).firstPage();
              const record = records[0];
              return record.getId();
          }
    } catch (err) {
        console.log(err);
    }
}  
   
/* *
 *  This function updates whether a user correctly completed a question
 *  @param {String} user email
 *  @param {String} a question
 *  @param {String} 1 or 0 indicating whether to be marked correct or wrong
 *  @public
 */
async function updateCompletion(userEmail, question, update) {
    const id = await getRecordID(userEmail);
    base('Users').update(id, {
        question : update
    }, function(err, record) {
        if (err) {
            console.error(err);
            return;
        }
        console.log(record.get(question));
    });  
}  
   
/**
 *  This function returns a user's progress, either overall or for a module.
 *  @param {String} user email
 *  @param {number} the module number [1, 5] (or 0, for total progress)
 *  @returns {number} the progress percentage (questions completed / total questions * 100)
 *  @public
 */
async function getProgress(userEmail, module) {
    try {
        if ((typeof userEmail === 'string' || userEmail instanceof String) && (typeof module === 'number' || module instanceof Number)) {
            const records = await base('Users').select({
                filterByFormula: "{user_email}='" + userEmail + "'",
            }).firstPage();
            const record = records[0];
            var output;
            if (module == 0) {
                output = record.get('totalProgress');
            } else {
             output = record.get(module + '_progress');
            }
            return output;
        }
    } catch (err) {
        console.log(err); 
    }
}

/**
 * This function returns all progress points of a user
 * @param {String} user email
 * @returns {JSON} a JSON string of a dictionary of the user's progress for each module and in total
 * @public
 */
async function getUserProgress(userEmail){
    try {
        if (typeof userEmail === 'string' || userEmail instanceof String) {
              const records = await base('Users').select({
                  filterByFormula: "{user_email}='" + userEmail + "'",
              }).firstPage();
              const record = records[0];
              var outputs = {};
              for (var i = 0; i < 6; i++) {
                  var output;
                  if (i == 0){
                      output = record.get('totalProgress');
                  } else {
                      output = record.get(i + '_progress');
                  }
                  outputs[i] = output
              }
              return JSON.stringify(outputs);
          }
    } catch (err) {
        console.log(err);
    }
}

async function addUser(userEmail, firstName, lastName) {
    base('Users').create({
        "user_email": userEmail,
        "user_first_name": firstName,
        "user_last_name": lastName
       }, function(err, record) {
        if (err) {
            console.error(err);
            return;
        }
        //console.log(record.getId());
    });
}

async function addUsers(userEmails, firstNames, lastNames) {
    for (var i = 0; i < userEmails.length; i++) {
        addUser(userEmails[i], firstNames[i], lastNames[i]);
    }
}
