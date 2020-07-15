import 'airtable.browser.js';

var base = new Airtable({ apiKey: 'ENTER API KEY' }).base('ENTER BASE KEY');

const totalQuestions = 15;

//given the question, returns the correct answer
function String getCorrectAnswer(String question) {
    base('QuestionDB').select({
        filterByFormula: {'Name'} = question
    }).eachPage(function page(records, fetchNextPage()) {
        records.forEach(function(record) {
            return record.get('Correct Answer');
        });
    };
}

//given the question and the user answer, return whether user answer was correct
function boolean checkAnswer(String question, String answer) {
    return getCorrectAnswer(question).equals(answer);
}

//gets the progress for the module (or overall, if input == 0)
function double getProgress(String userEmail, int module) {
    var completedQuestions = 0;
    base('TestUserDB').select({
        filterByFormula: {'user_email'} = userEmail
    }).eachPage(function page(records, fetchNextPage()) {
        records.forEach(function(record) {
            completedQuestions = record.get('Completed Questions');
        });
    });
    return completedQuestions/totalQuestions;
}
