author: jack
tag:  backoffice
title: Contributing

Contributing
============

If you want to contribute, please contact Jack Hayhurst. He administers the repository behind this.

Wiki Rules
----------

* You may not post anything internal or specific to your employer here.
* The main admin of this wiki already faces harassment for this wiki.
* If this wiki is put in jeopardy, we will displine the individual to support the wiki.

Editing Guidelines
------------------

info> These editing guidelines may change.

* Create a branch, make your changes there, then submit a pull request, and an issue to discuss your pull request.
* Each branch and pull request should contain changes around one specific idea.
* For a pull request to be pulled in, you must have two authors for each page sign off on the edits for that page.
* Each page must have at least two authors.
* Each page should be categorized as needed.
* Direct changes to `master` should not be done - merge pull requests.
* Be prepared to defend your changes, but also be prepared to revise or discard them.

Style Guidelines
----------------

info> These style guidelines may change.

This wiki is currently written with the following priorities:

* Examples should be obvious and explained.
* Mechanics and theory are encouraged, but should be encountered _after_ specific outlining.
* Demonstrations can be included, but are secondary to specific outlining. Blocks of commands are discouraged.
* Present material in the correct manner.
* Use the simplest words possible.
* Eliminate unnecessary language.
* Organize and re-organize as needed, but keep it clean.

Wiki Formatting
---------------

This wiki is made up of a series of Markdown files. Markdown, as a specification, is determined by these specifications:

* [Formal Markdown Specificiation](http://daringfireball.net/projects/markdown/)
* [GitHub Flavored Markdown Specification](https://help.github.com/articles/github-flavored-markdown/)
* [Generic Markdown Cheatsheet](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)

Additional modifications to generic Markdown are listed below.

#### Alert Boxes ####

As an additional extension (on top of Github flavored markdown), this wiki supports Alert boxes with the following syntax:

Examples:

    danger> The contents of this box are danger. `danger`, `warning`, `success`, and `info` are all supported.

danger> The contents of this box are danger. `danger`, `warning`, `success`, and `info` are all supported.

warning> You have been put on notice.

success> I just figured that might be helpful info.

info> OK?

#### Authors ####

Every page should have at least two authors, and may have more. Authors are the individuals responsible for the content on that page; they are expected to verify any new edits, keep the page current, and if anything goes wrong they are expected to correct it.

Authors are listed on a page in the following format. Each author must have a unique name.

```
author=jack
author=cfisher
```

[All authors may be viewed here](/author/).

#### Tags ####

Every page should have every tag relevant to that page tagged on that page. Tags should be kept up to date. Authors are responsible for verifying the tags.

Tags can be listed as follows.

```
tag=mysql
tag=apache
```

[All tags may be viewed here](/tag/).