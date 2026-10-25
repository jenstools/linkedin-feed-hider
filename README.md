# LinkedIn Feed Hider

A tiny Chrome extension that hides the LinkedIn feed by default. A **Show feed** button sits where the feed would be, so you can bring it back when you actually want it. Every fresh visit to the feed starts hidden again.

Messaging, notifications, profiles, search, and the "Start a post" box keep working as usual.

## Install

1. Open `chrome://extensions`
2. Turn on **Developer mode** (top right)
3. Click **Load unpacked** and pick this folder
4. Open or reload [linkedin.com/feed](https://www.linkedin.com/feed/)

## How it works

- `content.css` hides the feed list and its posts while `<html>` has the `lfh-hidden` class.
- `content.js` sets that class on `/feed` pages and inserts the toggle button above the feed. A `MutationObserver` handles LinkedIn's single-page navigation.
- If LinkedIn changes its markup and the feed container can't be found, the button floats in the bottom-right corner so it's still reachable.

No permissions, no tracking, no network requests.
