import 'airtable.browser.js';

var base = new Airtable({ apiKey: 'ENTER API KEY' }).base('ENTER BASE KEY');

const totalQuestions = 15;

//given the question, returns the correct answer
function String getCorrectAnswer(question) {
    if (typeof question === 'string' || question instanceof String) {
        base('QuestionDB').select({
            filterByFormula: {'Name'} = question
        }).eachPage(function page(records, fetchNextPage()) {
            records.forEach(function(record) {
                return record.get('Correct Answer');
            });
        };
    } else {
        throw "Argument must be of type string";
    }
}

//given the question and the user answer, return whether user answer was correct
function boolean checkAnswer(question, answer) {
    if ((typeof question === 'string' || question instanceof String) && (typeof answer === 'string' || answer instanceof String)) {
        return getCorrectAnswer(question).equals(answer);
    } else {
        throw "Arguments must be of type string";
    }
}

//gets the progress for the module (or overall, if input == 0)
function double getProgress(userEmail, module) {
    if ((typeof userEmail === 'string' || userEmail instanceof String) && (typeof module === 'number' || module instanceof Number)) {
        var completedQuestions = 0;
        base('TestUserDB').select({
            filterByFormula: {'user_email'} = userEmail
        }).eachPage(function page(records, fetchNextPage()) {
            records.forEach(function(record) {
                completedQuestions = record.get('Completed Questions');
            });
        });
        return (completedQuestions/totalQuestions)*100;//return a percentage
    } else {
        throw "Arguments must be of type string and of type number";
    }
}
