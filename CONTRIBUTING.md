# Contributing to the Leaf Repo 
Want to help contribute to Leaf? Awesome! There are many ways you can help be part of the Leaf developer community.

Please take a minute to review this document to make your contribution easy and effective for everyone involved.

## Posting an Issue 

Please utilize GitHub issue tracker to post bugs, feature enhancements, and to submit pull requests. Keep the following in mind when creating an issue - Please:

- Do not use the issue tracker for support. We will post documentation if a support issue is found to be common with our partners. 

- Do not post opinions or otherwise unstructured/irrelevant information. Keep the focus on the discussion at hand.

- Use relevant pre-determined labels; ‘feature request’ or ‘bug’?

- Keep the issue title clear and concise. 

## Bug reports 

A bug is a demonstrable problem with a list of steps that were taken to get said bug. Also, the cause has to be limited strictly by the code in the repository. Posting bug issues are extremely helpful for the greater good and we HIGHLY encourage you to post directly to the Leaf repo. 

Guidelines for bug reports: 

- Please check if the issue has already been reported. 

- Please check if the issue has been addressed — perform a ‘test’ and try reproducing your bug using the latest development branch in the repository. 

- Isolate the problem  

A good rule of thumb - a bug report shouldn't leave folks hanging, and they shouldn’t have to chase you down to get more info. With that said, please try to be as detailed as possible and start each report by answering the following questions:  

- What is your environment?  
- What steps will reproduce the issue?  
- What did you expect the outcome to be/ what should have happened?  
- What *did* happen? 
 
## Features and enhancements 

Of course, feature requests are welcome, but please take into account if your request fits in with the greater good of the community. More than likely you will not be the only one that would benefit from your request, but still try to think critically about it. Please provide as much detail and context as possible. 

## Pull requests 

Good pull requests - improvements, new features - are a fantastic help. They should remain focused in scope and avoid containing unrelated commits. 

Please ask us first before embarking on any significant pull request, we really want big feature enhancements, etc. to be a collaborative effort. Please reach out to us! 

Please adhere to the coding conventions used throughout a project (indentation, accurate comments, etc.) and any other requirements (such as test coverage). 

Follow this process if you'd like your work considered for inclusion in the project: 

Fork the project, clone your fork, and configure the remotes: 

```bash
# Clone your fork of the repo into the current directory 
git clone https://github.com/<your-username>/leaf

# Navigate to the newly cloned directory 
cd leaf 

# Assign the original repo to a remote called "upstream" 
git remote add upstream https://github.com/uwrit/leaf
```

If you cloned a while ago, get the latest changes from upstream: 

```bash
git checkout <dev-branch>
git pull upstream <dev-branch> 
```

Create a new topic branch (off the main project development branch) to contain your feature, change, or fix: 

```bash
git checkout -b <topic-branch-name>
```

Commit your changes in logical chunks. Please adhere to these git commit message guidelines or your code is unlikely be merged into the main project. Use Git's interactive rebase feature to tidy up your commits before making them public. 

Locally merge (or rebase) the upstream development branch into your topic branch: 

```bash
git pull [--rebase] upstream <dev-branch> 
```

Push your topic branch up to your fork: 

```bash
git push origin <topic-branch-name>
```

Open a Pull Request with a clear title and description. 

IMPORTANT: By submitting a patch, you agree to allow us to license your work under the same license is that used by the project. 

 