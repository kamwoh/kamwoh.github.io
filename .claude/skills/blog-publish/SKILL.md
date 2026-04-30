---
name: blog-publish
description: Publish a blog post from a markdown source. Use when the user finishes writing `blog/<slug>/original.md` and wants to publish — typical triggers include "publish my blog post", "publish <slug>", "I'm done with the blog post", "ship the blog". The skill renders `original.md` to HTML, regenerates `blog/<slug>/index.html`, then updates `sitemap.xml`, `feed.xml`, and the home-page blog list. Do NOT invoke for one-off edits to an already-published post unless the user explicitly says "republish".
---

# Blog publish workflow

You convert a markdown draft into a deployable static blog post. The author writes one file (`original.md`); you produce everything else.

## Inputs

The author maintains:

```
blog/<slug>/original.md
```

with this YAML front-matter (everything below the closing `---` is the body):

```yaml
---
title: <post title>
date: YYYY-MM-DD
blurb: <one-line summary, used in meta description, RSS, and home blog list>
tags: tag1, tag2          # optional, comma-separated
---

(markdown body here)
```

`<slug>` is the parent directory name and becomes the URL path: `/blog/<slug>/`.

## Steps

Always work in this order. One step at a time, verify each.

### 1. Confirm and read

- Identify the slug. If the user said "publish welcome", the slug is `welcome`. If ambiguous, ask.
- Read `blog/<slug>/original.md`. Parse the front-matter (everything between the first two `---` lines) and the body (everything after).
- Validate front-matter has `title`, `date`, `blurb`. If anything is missing, stop and ask the author.

### 2. Render markdown → HTML

Convert the body of `original.md` (ignoring front-matter) to an HTML fragment.

Use these markdown rules — be precise; no surprises:

| Markdown | HTML |
|---|---|
| `# Heading` | `<h1>Heading</h1>` (avoid in body — title is already h1) |
| `## Heading` | `<h2>Heading</h2>` |
| `### Heading` | `<h3>Heading</h3>` |
| Blank-line-separated text | `<p>...</p>` |
| `**bold**` | `<strong>bold</strong>` |
| `*italic*` or `_italic_` | `<em>italic</em>` |
| `` `code` `` | `<code>code</code>` |
| ```` ```lang \n ... \n ``` ```` | `<pre><code class="language-lang">...</code></pre>` |
| `[text](url)` | `<a href="url">text</a>` — and add `rel="noreferrer" target="_blank"` if `url` starts with `http` and is not on `kamwoh.github.io` |
| `- item` (unordered) | `<ul><li>item</li></ul>` |
| `1. item` (ordered) | `<ol><li>item</li></ol>` |
| `> quote` | `<blockquote><p>quote</p></blockquote>` |
| `---` (on its own line) | `<hr>` |
| `![alt](url)` | `<img src="url" alt="alt">` |

HTML-escape `<`, `>`, `&` inside text and code. Preserve them only inside fenced code blocks (still escape, since the browser would otherwise interpret `<` as a tag).

### 3. Regenerate `blog/<slug>/index.html`

Read the template at `.claude/skills/blog-publish/post.template.html`. Substitute these placeholders (every occurrence):

| Placeholder | Source |
|---|---|
| `{{TITLE}}` | front-matter `title` |
| `{{BLURB}}` | front-matter `blurb` |
| `{{DATE}}` | front-matter `date` |
| `{{SLUG}}` | parent directory name |
| `{{BODY_HTML}}` | rendered HTML fragment from step 2 |

In `{{TITLE}}` and `{{BLURB}}`, escape `"` as `&quot;` for use inside HTML attributes (the template uses double-quoted attrs).

Write the result to `blog/<slug>/index.html` (overwrite if exists).

### 4. Update `sitemap.xml`

Read the existing file. If a `<url>` block for `https://kamwoh.github.io/blog/<slug>/` already exists, update its `<lastmod>` to today (`date +%Y-%m-%d`). Otherwise, append a new block before `</urlset>`:

```xml
  <url>
    <loc>https://kamwoh.github.io/blog/<slug>/</loc>
    <lastmod>YYYY-MM-DD</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
```

### 5. Update `feed.xml`

If a matching `<item>` exists (same `<guid>`), update its content. Otherwise prepend a new `<item>` immediately after the existing channel metadata (`<lastBuildDate>` line), so newest is first:

```xml
    <item>
      <title>{{TITLE}}</title>
      <link>https://kamwoh.github.io/blog/<slug>/</link>
      <guid isPermaLink="true">https://kamwoh.github.io/blog/<slug>/</guid>
      <pubDate>{{RFC822_DATE}}</pubDate>
      <description>{{BLURB}}</description>
    </item>
```

`{{RFC822_DATE}}` is the front-matter date converted to RFC 822 (`date -d YYYY-MM-DD -R` produces it; example: `Wed, 29 Apr 2026 00:00:00 +0000`).

Also update the channel's `<lastBuildDate>` to the current RFC 822 timestamp.

### 6. Update home-page blog list

Edit `index.html`. Find `<div class="blog-list">`. If an `<article class="blog-item">` already links to `/blog/<slug>/`, update its date/title/blurb/tags in place. Otherwise insert a new entry **at the top** of the list:

```html
<article class="blog-item" itemscope itemtype="https://schema.org/BlogPosting">
  <meta itemprop="author" content="Kam Woh Ng">
  <time class="blog-item__date" datetime="{{DATE}}" itemprop="datePublished">{{DATE}}</time>
  <a href="/blog/<slug>/" class="blog-item__title" itemprop="url">
    <span itemprop="headline">{{TITLE}}</span>
  </a>
  <p class="blog-item__blurb" itemprop="description">{{BLURB}}</p>
  <div class="blog-item__meta">
    {{TAGS_HTML}}
  </div>
</article>
```

`{{TAGS_HTML}}` is one `<span class="blog-item__tag">tag</span>` per tag in the front-matter. Skip the `<div class="blog-item__meta">` entirely if there are no tags.

### 7. Verify

Run a quick local check (the dev server should already be running on :4000; if not, the author can start `python3 -m http.server 4000`).

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4000/blog/<slug>/
```

Then validate every JSON-LD block in the new `index.html` parses as JSON.

Report a one-line summary: slug, URL, files written/updated.

## Rules

- **`original.md` is sacred.** Never modify it. The author owns it.
- **Don't change the home page beyond the blog list.** The journey/publications/profile sections are off-limits.
- **Don't deploy.** Stop after step 7. The author runs `git push` themselves.
- **Atomic writes.** If any step fails (e.g., front-matter missing a field), do not partially update sitemap/feed/home page. Stop and report.
