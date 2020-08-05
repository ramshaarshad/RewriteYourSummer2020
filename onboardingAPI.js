var http = require('http');

http.createServer(async function (req, res) {
  // res.writeHead(200, {'Content-Type': 'text/html'});
  // res.end('Hello World!');

  console.log("adding new user test 3");
  await addUser("test 3 email", "test 3 first name", "test 3 last name");
  console.log("------------------------------------");
  console.log("updating test 2 email 1c to 1");
  await updateCompletion("test 2 email", "1c", 1);
  console.log("------------------------------------");
  for (var i = 0; i < questions.length; i++) {
      console.log("RETRIEVING " + questions[i]);
      await getCorrectAnswer(questions[i]).then(answer => console.log("GOT: " + answer));
  }
  console.log("------------------------------------");
  for (var i = 0; i < 6; i++) {
     await getProgress('li.10011@buckeyemail.osu.edu', i).then(progress => console.log("GOT: " + progress));
  }
  console.log("------------------------------------");
  await getUserProgress('li.10011@buckeyemail.osu.edu').then(info => console.log("GOT: " + info));
  console.log("------------------------------------");
  await checkAnswer("1a", "B").then(ret => console.log("is B correct for 1a? " + ret));
  console.log("------------------------------------");
  await checkAnswer("1a", "A").then(ret => console.log("is A correct for 1a? " + ret));
  console.log("------------------------------------");
  await getPassword('li.10011@buckeyemail.osu.edu').then(pass => console.log("GOT PASSWORD HASH: " + pass));
  console.log("------------------------------------");
  await checkPassword('li.10011@buckeyemail.osu.edu', 'cat').then(ret => console.log("password match? " + ret));
  console.log("------------------------------------");
  await updatePassword('test 3 email', 'happy camper');
}).listen(5000);


const bcrypt = require('bcryptjs')
const saltRounds = 10;
var Airtable = require('airtable');
var base = new Airtable({ apiKey: '' }).base('');

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
            //console.log(question + ": " + record.get('correct_ans'));
            return record.get('correct_ans');
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
        const ans = await getCorrectAnswer(question);
        return ans === answer;
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
    await getRecordID(userEmail).then(id => {
        base('Users').update(id, {
            [question] : update,
        }, function(err, record) {
            if (err) {
                console.error(err);
                return;
            }
            // console.log(record.get(question));
        })
    })
    .catch(":(");
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
                maxRecords: 1,
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

async function getUserProgress(userEmail) {
    try {
        if (typeof userEmail === 'string' || userEmail instanceof String) {
              const records = await base('Users').select({
                  filterByFormula: "{user_email}='" + userEmail + "'",
                  maxRecords: 1,
              }).firstPage();
                const record = records[0];
                  //console.log(record);
                      var outputs = {};
                      for (var i = 0; i < 6; i++) {
                          var output;
                          if (i == 0) {
                              output = record.get('totalProgress');
                          } else {
                              output = record.get(i + '_progress');
                          }
                          outputs[i] = output
                      }
                      //console.log(outputs);
                      //console.log(record.get('totalProgress'));
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
        "user_last_name": lastName,
        "1a":0,
        "1b":0,
        "1c":0,
        "2a":0,
        "2b":0,
        "2c":0,
        "3a":0,
        "3b":0,
        "3c":0,
        "4a":0,
        "4b":0,
        "4c":0,
        "5a":0,
        "5b":0,
        "5c":0,
    }, function(err, record) {
        if (err) {
            console.error(err);
            return;
        }
    });
}

async function addUsers(userEmails, firstNames, lastNames) {
    for (var i = 0; i < userEmails.length; i++) {
        addUser(userEmails[i], firstNames[i], lastNames[i]);
    }
}

async function getPassword(userEmail) {
    try {
        if (typeof userEmail === 'string' || userEmail instanceof String) {
            const records = await base('Users').select({
                filterByFormula: "{user_email}='" + userEmail + "'",
                maxRecords: 1,
            }).firstPage();
            const record = records[0];
            return record.get('Hashword');
            }
    } catch (err) {
        console.log(err);
    }
}

async function checkPassword(userEmail, userInput) {
    if ((typeof userEmail === 'string' || userEmail instanceof String) && (typeof userInput === 'string' || userInput instanceof String)) {
        const hash = await getPassword(userEmail);
        console.log("checking " + hash);
        const resp = await bcrypt.compare(userInput, hash);
        // console.log(resp);
        return resp;
    }
}

async function updatePassword(userEmail, newPass) {
  var hashword;
  bcrypt.genSalt(saltRounds, function (err, salt) {
        if (err) {
            throw err
        } else {
            bcrypt.hash(newPass, salt, function (err, hash) {
                if (err) {
                    throw err
                } else {
                    console.log("hash successful");
                    console.log(newPass + " hashed to " + hash);
                    hashword = hash;
                }
            });
        }
    });
    getRecordID(userEmail).then(id => {
        base('Users').update(id, {
            Hashword : hashword,
        }, function(err, record) {
            if (err) {
                console.error(err);
                return;
            }
            // console.log(record.get('Hashword'));
        })
    });

}
