---
layout: home
pagination:
  data: collections.posts
  size: 10
permalink: "/{% if pagination.pageNumber > 0 %}strona-{{ pagination.pageNumber | plus: 1}}/{% endif %}index.html"
---
