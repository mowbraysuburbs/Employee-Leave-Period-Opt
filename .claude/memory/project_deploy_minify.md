---
name: project-deploy-minify
description: Before deploying the app, remind the user to minify game.js and style.css
metadata:
  type: project
---

Always remind the user to minify `game.js` and `style.css` before deploying.

**Why:** Senior SE advised this — minification strips whitespace/comments from JS and CSS, reducing file size by ~30–50% for faster load times, especially on mobile.

**How to apply:** When the user says "deploy my app" or anything about deploying/pushing to production, remind them to minify first. Suggested tools: Terser (for JS), cssnano (for CSS).
