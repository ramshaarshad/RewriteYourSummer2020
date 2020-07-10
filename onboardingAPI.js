import 'airtable.browser.js';

var base = new Airtable({ apiKey: 'ENTER API KEY' }).base('ENTER BASE KEY');

function getCorrectAnswer(String question) {
    base('QuestionDB').select({
        filterByFormula: {Name'} = question
    }).eachPage(function page(records, fetchNextPage()) {
        records.forEach(function(record) {
            return record.get('Correct Answer');
        });
        fetchNextPage();
    }, function done(error) {
        console.log(error);
    });

};
