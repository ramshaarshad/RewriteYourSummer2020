import 'airtable.browser.js';

var base = new Airtable({ apiKey: 'ENTER API KEY' }).base('ENTER BASE KEY');

function deleteMember(record) {
    record.destroy(function(err) {
        if (err) {
            console.log('Error destroying ', recordId, err);
        } else {
            console.log('Destroyed ', record.getId());
        }
    });
};

function getMember() {
    $('#members').empty();

    base('TestUserDB').select({
        sort: [
            {field: 'user_last_name', direction: 'asc'}
        ]
    }).eachPage(function page(records, fetchNextPage) {
        records.forEach(function(record) {

            });
        });
        fetchNextPage();
    }, function done(error) {
        console.log(error);
    });
};

function addMember(String firstName, String lastName, String email) {
    base('TestUserDB').create({
        "user_first_name": firstName,
        //"user_id": "8",
        "user_last_name": lastName,
        "user_email": email
    }, function(err, record) {
});

