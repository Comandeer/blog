---
layout: project
project: blog
pagination:
  data: collections.project-blog
  size: 10
permalink: "/projekty/blog{% if pagination.pageNumber > 0 %}/strona-{{ pagination.pageNumber | plus: 1}}{% endif %}/index.html"
---

