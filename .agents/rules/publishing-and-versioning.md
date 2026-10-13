# Publishing and Versioning Workflow for Tabby Plugins

Whenever changes, bug fixes, or enhancements are made to plugins (`tabby-quick-cmds-toolbar`, `tabby-error-highlight`, etc.):

1. **Synchronized Versioning (GitHub + npmjs):**
   - Every time code or metadata is modified, the version must be incremented (`patch`, `minor`, or `major`).
   - Use `npm version patch` (or minor/major) so `package.json`, Git commit, and Git tags stay 100% in sync.
   - Always push both the branch and the tags to GitHub:
     ```bash
     git push && git push --tags
     ```

2. **Publishing to npmjs:**
   - Immediately keep the published npmjs registry up-to-date with GitHub.
   - Run:
     ```bash
     npm publish --access public
     ```
   - Remind the user to confirm 2FA proof-of-presence if prompted by the browser.

3. **Author and URLs Consistency:**
   - GitHub username: `rubenleonn` (https://github.com/rubenleonn)
   - npmjs username: `rubenleon`
   - Keep repository, homepage, and author links pointing to `rubenleonn`.
