author: jack
topic: backoffice
title: guidelines

Wiki Guidelines
===============

Contribute
----------

To contribute, [please see the contribution page](/contrib.md).

Features
--------

This wiki includes:

- [x] Markdown parsing handler
- [x] Raw file handler
- [x] Code Block Syntax highlighting
- [x] Topic tags
- [x] Indexer for pages
- [x] Simple Search handler
- [x] Alert Boxes
- [x] Topic Listing Handler
- [x] Advanced Search Handler


Currently Planned Categories
--------------

* MySQL
* OpenSSL
* OpenSSH
* Man Pages
* Exim
* Apache
* Scripts

To see actual categories, please [visit the topic section](/topic/).

Wiki Goals
----------

The server powering this wiki gnosis, the articles written for this wiki, and the git repository used to hold those articles were created with reason. There were things lacking/issues with the old wiki - this system sets out to fix each issue.

* Wiki editing was mostly open before, it is now restricted.
 * Having an open wiki allowed less knowledgable edits, which in turn led to a lower quality wiki.
 * Using `git`, we can restrict the master branch of the wiki to a group of known experienced admins and editors.
 * Using `git`, we can create branches (as many as are needed) and allow people to edit pages there, andn submit pull requests.
* Change blame (good or bad) was difficult before, it now becomes `git blame`.
 * Using the tools within `git`, we can easily determine the origin of a specific edit.
 * We can look at a specific itme in the wiki, determine who added it, and then ask them why they added it.
* Searching in mediawiki is difficult and weird.
 * A new searching system - closely tied to the categories - will be built into this wiki.
* Viewing related topics was almost secondary to the old wiki.
 * Pages are marked with topics and topic listing pages will be present.
* Mediawiki is an awkard language to write, markdown is more fluid.
 * Mediawiki also happens to encourage writing longer documents. Markdown encourages brevity.
 * Since this is an alternate format, we will have to rewrite everything
 * Every page on our wiki needs a rewrite anyway
* The mediawiki editor is browser based and constraining - you can pick your editor with this. Suggestions:
 * [Atom](https://atom.io/)
 * [Caret](https://chrome.google.com/webstore/detail/caret/fljalecfjciodhpcledpamjachpmelml?hl=en)
 * [Sublime](http://www.sublimetext.com/3)
 * Vim with [Markdown Highlighting](https://github.com/plasticboy/vim-markdown)
* All page rendering is done server side.
 * This allows indexing by search engines.
 * This also makes for a faster experience.
 * Lightweight Javascript is used for minor things - but not required for page formatting.
* Topics can be restricted within a handler.
 * Pages with a specific topic on them will not be displayed.
 * This allows for a public and private wiki from the same pages.
 * We need the resources to help our customers, and we're not allowed to use resources from other companies.
