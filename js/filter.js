var filters = document.getElementsByClassName('topic');
for (var i=0; i < filters.length; i++) {
  filters[i].onclick = function(e) {
    e = e || window.event;
    var target = e.target || e.srcElement;
    var tagName = target.getAttribute('data-name'); // get target tag name

    var topicEls = [].slice.call(document.getElementsByClassName('topic'));
    for (var i = 0, len = topicEls.length; i < len; i++) {
      var content = topicEls[i].getAttribute('data-name');
      if (content.indexOf(tagName) > -1) {
        // mark selected topic
        topicEls[i].className = topicEls[i].className.replace(/btn-info/g, 'btn-success');
      }
      else {
        // unmark non-selected topic
        topicEls[i].className = topicEls[i].className.replace(/btn-success/g, 'btn-info');
      }
    }

    // console.log(tagName);
    var liEls = document.getElementsByTagName('li');

    var numShown = 0;

    for (var i = 0, len = liEls.length; i < len; i++) {
      var content = liEls[i].getElementsByClassName('tags')[0].textContent;
      if (content.indexOf(tagName) > -1 || tagName == 'all') {
        liEls[i].className = liEls[i].className.replace(/hidden/g, '');
        numShown++;
      }
      else {
        liEls[i].className += ' hidden';
      }
    }
  }
};