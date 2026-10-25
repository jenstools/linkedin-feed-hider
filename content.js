// Hides the LinkedIn feed by default and adds a button to bring it back.
// The choice only lasts for the current page view: every fresh visit to /feed starts hidden.

// Current LinkedIn feed list. Its first child is the "Start a post" box.
const MAIN_FEED = '[data-testid="mainFeed"]';
// Older LinkedIn markup: the button goes right before the feed container.
const FEED_CONTAINERS = [
  '[data-finite-scroll-hotkey-context="FEED"]',
  'main .scaffold-finite-scroll',
];
const POST = '[data-urn^="urn:li:activity"], [data-id^="urn:li:activity"], .feed-shared-update-v2';
const HIDDEN = [...FEED_CONTAINERS, POST].join(', ');

let showFeed = false;
let lastPath = null;

// Only the feed itself. Post pages like /feed/update/urn:li:activity:…/ stay untouched.
const isFeedPage = () => /^\/feed\/?$/.test(location.pathname);

// Notifications link to /feed/?highlightedUpdateUrn=…, which is the full feed with that post on top.
// Send those to the post's own page instead, so the link works without showing the feed.
let redirecting = false;
function redirectToPost() {
  const urn = new URLSearchParams(location.search).get('highlightedUpdateUrn');
  if (!isFeedPage() || !urn || redirecting) return redirecting;
  redirecting = true;
  location.replace(`/feed/update/${urn}/`);
  return true;
}

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
  if (redirectToPost()) return;
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

  const mainFeed = document.querySelector(MAIN_FEED);
  const anchor = mainFeed ? null : findAnchor();
  if (mainFeed) {
    bar.classList.remove('lfh-floating');
    // Hidden: right under "Start a post". Shown: above the list, since the feed below never ends.
    if (showFeed && bar.nextElementSibling !== mainFeed) mainFeed.before(bar);
    if (!showFeed && bar.previousElementSibling !== mainFeed) mainFeed.after(bar);
  } else if (anchor) {
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
