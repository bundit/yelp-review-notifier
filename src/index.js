const axios = require('axios');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const URI = 'https://www.yelp.com/biz/sawasdee-soquel';
const SORT_NEW = '?sort_by=date_desc';
const QUERY_SELECT = '.lemon--ul__373c0__1_cxs';
const NUM_REVIEWS = 20;



axios.get(URI + SORT_NEW)
.then(response => processAndFormatData(response.data))
.then(reviews => console.log(reviews));


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
    li = li.firstChild.children[1].firstChild.firstChild;
    reviews.push({
      date: new Date(li.children[1].firstChild.textContent),
      rating: Number(li.firstChild.firstChild.firstChild.getAttribute('aria-label')[0])
    })
  })

  return reviews;
}
