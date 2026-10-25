// Hides the LinkedIn feed by default and adds a button to bring it back.
// The choice only lasts for the current page view: every fresh visit to /feed starts hidden.

const FEED_CONTAINERS = [
  '[data-finite-scroll-hotkey-context="FEED"]',
  'main .scaffold-finite-scroll',
];
const POST = '[data-urn^="urn:li:activity"], [data-id^="urn:li:activity"], .feed-shared-update-v2';
const HIDDEN = [...FEED_CONTAINERS, POST].join(', ');

let showFeed = false;
let lastPath = null;

const isFeedPage = () => location.pathname.startsWith('/feed');

// Where to put the button: right above the feed list, or above the first post as fallback.
function findAnchor() {
  let el = FEED_CONTAINERS.map((s) => document.querySelector(s)).find(Boolean)
    ?? document.querySelector(POST)?.parentElement;
  // Climb out of anything that gets hidden, or the button would vanish with it.
  for (let outer; el && (outer = el.parentElement?.closest(HIDDEN)); ) el = outer;
  return el ?? null;
}

// Only touch the DOM when something changed, otherwise the observer below would loop forever.
function setText(el, text) {
  if (el.textContent !== text) el.textContent = text;
}

function render() {
  const onFeed = isFeedPage();
  document.documentElement.classList.toggle('lfh-hidden', onFeed && !showFeed);

  let bar = document.getElementById('lfh-bar');
  if (!onFeed) {
    bar?.remove();
    return;
  }
  if (!document.body) return;

  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'lfh-bar';
    bar.innerHTML = '<span class="lfh-text"></span><button type="button"></button>';
    bar.querySelector('button').addEventListener('click', () => {
      showFeed = !showFeed;
      render();
    });
  }

  bar.classList.toggle('lfh-shown', showFeed);
  setText(bar.querySelector('.lfh-text'), showFeed ? '' : 'Feed hidden. Stay focused. 🧘');
  setText(bar.querySelector('button'), showFeed ? 'Hide feed again' : 'Show feed');

  const anchor = findAnchor();
  if (anchor) {
    bar.classList.remove('lfh-floating');
    if (bar.nextElementSibling !== anchor) anchor.before(bar);
  } else {
    // Feed not rendered yet (or LinkedIn changed its markup): float the button so it's always reachable.
    bar.classList.add('lfh-floating');
    if (bar.parentElement !== document.body) document.body.append(bar);
  }
}

// LinkedIn is a single-page app, so watch for DOM changes and route changes.
new MutationObserver(() => {
  if (location.pathname !== lastPath) {
    lastPath = location.pathname;
    showFeed = false;
  }
  render();
}).observe(document.documentElement, { childList: true, subtree: true });

render();
