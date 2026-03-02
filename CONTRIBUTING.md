# CONTRIBUTING

This documentation outlines the general procedure for contributing to the typepress repository. If you wish to contribute please be sure to read the following resources:

 - [Code of Conduct](CODE_OF_CONDUCT.md)

## Reporting Security Issues

If you've encountered a security vulnerability, please send it to [contact@tomshaw.us](mailto:contact@tomshaw.us). I will work to verify the vulnerability and patch it as soon as possible.

When reporting issues, please provide the following information:

- A detailed description indicating how to reproduce the issue.

## Recommended Workflow 

Your first step is to establish a public repository from which we can pull your work into the master repository.

1. Fork the relevant repository
2. Clone the repository locally.

```console
$ git clone git://github.com/tomshaw/typepress.git
$ cd typepress
```

### Keeping Up-to-Date

Periodically, you should update your fork to match the typepress repository.

```console
$ git checkout master
$ git fetch origin
$ git rebase origin/master
```

If you're tracking other branches -- for example, the "develop" branch, where new feature development occurs -- you'll want to do the same operations for that branch; simply substitute "develop" for "master".

### Working on a patch

We recommend you do each new feature or bugfix in a new branch. This simplifies the task of code review as well as the task of merging your changes into the repository.

A typical workflow will consist of the following:

1. Create a new local branch based off your master branch.
2. Switch to your new local branch.
3. Do some work, commit, repeat as necessary.
4. Push the local branch to your remote repository.
5. Send a pull request.

#### What branch to issue the pull request against?

Which branch should you issue a pull request against?

- For fixes against the stable release, issue the pull request against the "master" branch.
- For new features, or fixes issue the pull request against the "develop" branch.

### Branch Cleanup

If you are a frequent contributor, you'll start to get a ton of branches both locally and on your remote. We suggest doing some cleanup of these branches.

-  Local branch cleanup

   ```console
   $ git branch -d <branchname>
   ```

-  Remote branch removal

   ```console
   $ git push {username} :<branchname>
   ```
