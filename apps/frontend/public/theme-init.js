try {
  var s = JSON.parse(localStorage.getItem('nxtchess:settings') || '{}');
  if (s.theme === 'light') {
    document.body.setAttribute('data-theme', 'light');
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', '#e8e1d6');
  }
} catch (e) {}
