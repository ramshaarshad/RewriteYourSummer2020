import "./airtable.browser.js";

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
    if (validQuestion(question)) {
        await base('QuestionDB').select({
            filterByFormula: "{question}='" + question + "'",
            maxRecords: 1,
        }).eachPage(function page(records, fetchNextPage) {
            records.forEach(function(record) {
                console.log(question + ": " + record.get('correct_ans'));
                return record.get('correct_ans');
            });
        });
    } else {
        throw "Expected: question";
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
    } else {
        throw "Expected: question, answer";
    }
}

//gets the progress for the module (or overall, if input == 0)
async function getProgress(userEmail, module) {
    if ((typeof userEmail === 'string' || userEmail instanceof String) && (typeof module === 'number' || module instanceof Number)) {
        await base('TestUserDB').select({
            filterByFormula: "{user_email}='" + userEmail + "'",
        }).eachPage(function page(records, fetchNextPage) {
            records.forEach(function(record) {
                var output;
                if (module == 0) {
                    output = record.get('totalProgress');
                } else {
                 output = record.get(module + '_progress');
                }
                return output;
            });
        });
    }
}

//gets the progress for the module (or overall, if input == 0)
async function getUser(userEmail){
  if (typeof userEmail === 'string' || userEmail instanceof String) {
        await base('TestUserDB').select({
            filterByFormula: "{user_email}='" + userEmail + "'",
        }).eachPage(function page(records, fetchNextPage) {
            records.forEach(function(record) {
                var outputs = [];
                for (var i = 0; i < 6; i++) {
                    var output;
                    if (i == 0){
                        output = record.get('totalProgress');
                    } else {
                        output = record.get(i + '_progress');
                    }
                    outputs.push(output);
                }
                return outputs;
            });
        });
    }
}

