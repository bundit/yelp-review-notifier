const axios = require('axios');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;


axios.get("https://yelp.com/biz/sawasdee-soquel")
.then(response => response.data)
.then(html => new JSDOM(html))
.then(dom => dom.window.document.querySelectorAll(".lemon--ul__373c0__1_cxs"))
.then(nodeList => {
  let ul;
  nodeList.forEach(node => {
    ul = node.children.length === 20 ? node : ul;
  })
  return ul;
})
.then(ul => {
  let reviews = [];

  ul.childNodes.forEach(li => {
    li = li.firstChild.children[1].firstChild.firstChild;
    reviews.push({
      date: new Date(li.children[1].firstChild.textContent),
      rating: Number(li.firstChild.firstChild.firstChild.getAttribute('aria-label')[0])
    })
  })
  return reviews;
})
.then(reviews => console.log(reviews));
