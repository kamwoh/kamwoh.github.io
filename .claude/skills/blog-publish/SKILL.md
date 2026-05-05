---
name: blog-publish
description: Publish a blog post on the kamwoh.github.io site. Use when the user has a draft ready and says "publish my blog post", "ship the blog", "publish <slug>", or similar. The author provides the draft (frontmatter + body) inline in conversation; the skill renders it to `blog/<slug>/index.html` and updates `sitemap.xml`, `feed.xml`, and the home-page blog list. The rendered HTML is the source of truth — there is no separate markdown source file kept on disk.
---

# Blog publish workflow

You convert a markdown draft (provided inline by the author) into a deployable static blog post. The rendered `blog/<slug>/index.html` is the source of truth — there is no `original.md` or other markdown file persisted on disk. Markdown is just an input format the author uses when publishing or republishing.

## Inputs

The author provides a draft directly in conversation, with this YAML front-matter (everything below the closing `---` is the body):

```yaml
---
title: <post title>
date: YYYY-MM-DD
blurb: <one-line summary, used in meta description, RSS, and home blog list>
tags: tag1, tag2          # optional, comma-separated
---

(markdown body here)
```

The slug is the parent directory under `blog/<slug>/` and becomes the URL path: `/blog/<slug>/`. If the user doesn't name a slug, propose one based on title keywords and confirm before proceeding.

## Steps

Always work in this order. One step at a time, verify each.

### 1. Get the draft

- Identify the slug. If the author said "publish welcome", the slug is `welcome`. If ambiguous, ask.
- Get the frontmatter (title, date, blurb, optional tags) and the markdown body. The author either pastes a full draft, or has been composing it in conversation. If anything required is missing, stop and ask — do not invent values.
- If `blog/<slug>/index.html` already exists, this is a republish: confirm with the author before overwriting.

### 2. Render markdown → HTML

Convert the body to an HTML fragment using these rules — be precise; no surprises:

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

### 3. Generate `blog/<slug>/index.html`

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

Edit `index.html` at the repo root. Find `<div class="blog-list">`. If an `<article class="blog-item">` already links to `/blog/<slug>/`, update its date/title/blurb/tags in place. Otherwise insert a new entry **at the top** of the list:

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

- **The HTML is the source of truth.** Do not write a `blog/<slug>/original.md` or any other persisted markdown source. Markdown is an input format only.
- **Editing an existing post:** the author can either describe the change (you edit the HTML directly), or paste a fresh full markdown draft (you re-render the page). Don't fabricate a markdown source file just for "consistency."
- **Don't change the home page beyond the blog list.** The journey/publications/profile sections are off-limits.
- **Don't deploy.** Stop after step 7. The author runs `git push` themselves.
- **Atomic writes.** If any step fails (e.g., a required front-matter field is missing), do not partially update sitemap/feed/home page. Stop and report.
