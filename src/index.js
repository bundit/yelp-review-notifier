// Module requires
const axios = require('axios');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const nodemailer = require('nodemailer');

// Secret shh...
const secret = require('../config/keys.js');

// Program variables
const URI = 'https://www.yelp.com/biz/sawasdee-soquel';
const SORT_NEW = '?sort_by=date_desc';
const QUERY_SELECT = '.lemon--ul__373c0__1_cxs';
const NUM_REVIEWS = 20;
const DAYS_FILTERED = 7;

axios.get(URI + SORT_NEW)
.then(response => processAndFormatData(response.data))
.then(reviews => {
  let filteredReviews = filterReviews(reviews, DAYS_FILTERED);

  // There are new reviews
  if (filteredReviews.length !== 0) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: secret.emailSender,
        pass: secret.emailPass
      }
    })

    const mailOptions = {
      from: 'notifier',
      to: 'example@gmail.com',
      subject: 'This is a test',
      html: '<p> new review has been posted<p>'
    }

    transporter.sendMail(mailOptions, function (err, info) {
      if (err)
        console.log(err);
      else
        console.log(info);
    });
  }
  else {} // There are no new reviews
    // Do nothing
});


// Process data returned in response.data from axios GET
// @param response body from http get
// @return list of review data {date, rating}
function processAndFormatData(html) {
  // Create dom object from string data
  let dom = new JSDOM(html);

  // Find the html elements you are looking for
  let nodeList = dom.window.document.querySelectorAll(QUERY_SELECT);

  // Find the ul with length of NUM_REVIEWS
  let ul;
  nodeList.forEach(node => {
    ul = node.childNodes.length === NUM_REVIEWS ? node : ul
  });

  // Extract the data and store them in a list
  let reviews = [];
  ul.childNodes.forEach(li => {
    li = li.firstChild.children[1];
    let date = new Date(li.firstChild.firstChild.children[1].firstChild.textContent);
    let rating = li.firstChild.firstChild.firstChild.firstChild.firstChild.getAttribute('aria-label')[0];
    let text = li.children[2].firstChild.firstChild.textContent;
    reviews.push({
      date: date,
      rating: rating,
      text: text
    });
  })

  console.log(reviews);

  return reviews;
}

// Given a list of reviews, returns a new list of reviews between today and number of days prior
// If no number of days is supplied then will return the revies posted today
// @param reviews the list of reviews [{date, rating, text}, .., ..]
// @param numDays the number of days to include (e.g 7 - between today and 1 week ago)
// @return list of filtered arrays
function filterReviews(reviews, numDays = 0) {
  const today = new Date();

  if (numDays === 0) {
    return reviews.filter(review => {
      let reviewDate = review.date;
      return dateIsEqual(today, reviewDate);
    })
  }
  else {
    const pastDay = new Date();
    pastDay.setDate(today.getDate() - numDays);

    return reviews.filter(review => {
      let reviewDate = review.date;
      return (reviewDate < today && reviewDate > pastDay)
    })
  }
}

// Given two date objects
// @return true if they are the same day/month/year
// @return false otherwise
function dateIsEqual(date1, date2) {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  )
}
