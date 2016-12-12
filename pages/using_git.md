author: jack
topic: source control
topic: git
title: git introduction

## Branching Model

Note: This section has been stolen from [this post](http://nvie.com/posts/a-successful-git-branching-model/).

When you are developing bigger software, managing everyone code and how things go together is complex.
Luckily, there's a handy diagram below.

![git-model](/static/images/git-model.png)

* `master` is your code that is live in production
* `release` is your code that is being tested for production
 * You push your code to release, test and test until it works (no new features), then deploy.
* `develop` is your branch where you add new features - it should never be broken
* You create branches from `develop` to create new features, then merge them back into `develop`
* If you find a big problem in `master`, you fix it in `hotfixes` or `bugfix` then push to `master` and `develop`

I'm going to leave the fundamentals of walking through that whole story to the author of that post.
Really, [go read it](http://nvie.com/posts/a-successful-git-branching-model/) it is well written.

## Git Fundamentals

So, now that you get the idea that, rather than doing all of our work live, we're going to break it up.
We break it up into branches, and organize ourselves into branches.

Git, by default, is not a centralized repository.
Most other version control works on this core concept - one central location everything else works against.
Git, instead, uses the same software everywhere.
As long as anyone can access any location, any location can be `origin`.
In honesty, `origin` is really just a crown we put on one location.

We can `pull` from any location to the same branch in any other location.
When we `pull`, we are catching one location up to another location.
In addition to that, we can `merge` any location into another location.
When we `merge`, we list the changes from the source, and apply them to the destination.

When we change files, we first have to mark what changes we want to include - `add` each change.
Once we have all of our changes added, we `commit` them with a message detailing the changes.
This creates a new `commit` or _checkpoint_ on the branch, tracking that point in time.
As an added bonus, you can go back to that point at any time.

You can modify your `remote` locations tracked in git.
Most often, when you first start working in a repository, you will `clone` it from a location.

There are also `tags` - a way to _bookmark a specific commit_.
There are `pull requests` or similar - allowing you to try to merge changes in.
There is a lot more stuff than all of this - but really, these are the basics you need.

## Basic Git Commands

First, [generate an SSH key](http://hostbaitor.com/openssh#generating-an-ssh-key), and [install that in GitHub](https://github.com/settings/keys).

- - - -

Next, you probably want to go [sign up for github](https://github.com/join) and [create a repository](https://github.com/new).
Go ahead. I'll wait. If not, you can simply go with someone else's.

OK SO NOW you go to your repository's page, and you clone with something like (this is for this repo):

```
git clone git@github.com:jhayhurst/emailz.git ~/emailz
```

The general format of that command is `git` `clone` `remote location` `local location`.
The local location is optional, it will simply put it in your current directory if left out.
With that command, I clone from the remote location to the location location.

- - - -

Now that you have the setup done for that repository, get into your normal workflow.
The first thing you usually do is go into the relevant directory:

```
cd ~/emailz
```

Next, you want to first switch to the branch you want to work on, and pull all changes down.

```
git checkout review
git pull
```

Now, you want to make your changes. I'm not going to go over this. Just do what you need to do.

Once you're done, _from the top of the repository_ you add the files you changed:

```
git add file.md
```

Or you add all files that have changed in the repository:

```
git add .
```

Next, you write your commit message and commit:

```
git commit
```

That should open an editor where you type in a commit message.
Quitting from that editor and saving the message will accept the commit.
Quitting and not saving will abandon the commit - as will an empty commit message.
I've included one (probably bad) example below.

```
git commit messages should have a first line shorter than 72 characters

* Then you list your specific changes
* you can use a bullet list of your choice
- nobody cares - you can even mix your bullet points
[ ] you can even use this style to use a check box
[x] or this style to denote a checked box

If you so decide you can also include a nice paragraph detailing a bunch
of different changes that you made, make it as long as you want. This can go
into whatever depth you want - write your thesis here. The big thing is your
first line should be a summary, and the end should be items that you fixed.

- as a final line, you usually want to list the issues that you fixed at the end

fixes #11 - writing an example commit
fixes #45 - covering bullet points
fixes #63 - short firstline commits
```

Now that you have changes on your local branch, you probably want to update GitHub.

```
git push
```

- - - -

Later on, when things get more complex, you might decide to change in branches instead.
To create a branch and switch to it:

```
git checkout -b branchname
```

Then, change and `commit`, `push` to GitHub, and as a final step, create a pull request.
To do so, open up the Merge Requests section of the project across the top of the page.

## Common git mistakes
If you made a mistake in Git, *and have not pushed those changes*, you can fix lots of things.
If you already pushed those changes off your machine, you should work against them.

### Forget one file?
notice> This only works if the changes are only local.

```
git add /files/to/add
git commit --amend
```

### Bad commit message?
notice> This only works if the changes are only local.

```
git commit --amend
```

### Accidentally committed on master
notice> This only works if the changes are only local.

```
git branch new-branch-name
git reset HEAD~ --hard
git checkout new-branch-name
```

Afterwards, remember to create a pull request in GitHub to get the changes back in.

## When you really fucked up

```
cd ..
sudo rm -r git-repo-directory
git clone https://github.com/git-repo-directory
cd git-repo-directory
```

If anyone tells you they've never wiped a git repository, then checked it right back out to fix things...
they're lying.

## Final notes

If you are using GitHub, I recommend [Github Desktop](https://desktop.github.com/) if you like a GUI.
I actually like the command line tools better after I've gotten used to them.
I also often use [VSCode](https://code.visualstudio.com/) often myself - but it's just a wrapper for the CLI.
There are [more options at git's page](https://git-scm.com/download/gui/linux).

I also recommend learing `vim`, as time spent learning `vim` will always pay off. 2c