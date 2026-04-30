---
title: Hello, World — and how this blog is built
date: 2026-04-29
blurb: A meta first post — how a static GitHub Pages site gets indexable blog posts without a backend.
tags: meta, seo
---

Hello! First post on the new blog.

I figured I'd start meta — a quick note on how the blog itself is wired up, since there's no backend.

The site is plain static HTML. Each post is one folder under `/blog/<slug>/`. GitHub Pages serves the files directly (the `.nojekyll` at the root tells it to skip Jekyll).

For Google to actually find posts, three things matter:

- JSON-LD `BlogPosting` schema in the `<head>`
- A `sitemap.xml`, a `robots.txt`, and an RSS [feed.xml](/feed.xml)
- Boring HTML hygiene — real `<article>` tags, alt text, OG meta, canonical URLs

That's basically the whole setup. No comments, no analytics. Maybe later.
