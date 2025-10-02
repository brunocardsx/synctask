## Git Workflow
- Do not include Claude Code on the commits message

## Coding Guidelines
TypeScript/JavaScript:
- Never use any; Almost never use "as".
- Aim for e2e type-safety;
- Let the compiler infer response types whenever possible.
- Always use named exports; Don't use default exports unless you have to.
- Don't have an index file only for exports.
- Prefer await/async over Promise().then()
- Unused vars should start with _ (or never exist at all);
- Prefer string literals over string concatenation.
- Don't abbreviate; use descriptive names.
- Always use early return over if-else.
- Prefer hash-lists over switch-case.
- Follow the programming language naming conventions (SNAKE_CAPS for constants, functions as camelCase, file names as kebab-case)
- Avoid indentation levels, strive for flat code.

React:
- Don't declare constants or functions inside components; keep them pure.
- Don't fetch data in useEffect, use React Query.
- Don't use magic strings for cache tags; use an enum/factory.
- Don't use magic numbers/strings;
- Use enum for react query cache strings
- Prefer <Suspense> and useSuspenseQuery over react query isLoading.
- Use errorBoundary with retry button

Software Programming;
- Avoid pre-mature optimization.
- Focus on:
  - e2e type-safety
  - observability
  - acessibility, a11y, WCAG 2.0 guidelines
  - security, OWASP best practices
- Comments are unnecessary 98% of the time, convert them to be a function/variable instead.
- Don't write pure SQL strings, query-builders help with type-safety and SQL-injection protection.
- use HighOrderFunctions for monitoring/error handling/profiling

Testing:
- Always test behavior, never test implementation
- Don't use should, use 3rd person verbs
- Write a test for each bug you fix, you'll never have to fix it again.
- Abuse the describe clauses

Writing:
- Cut the bs, be concise, don't waste readers time
- Prefer active voice: "We fixed the bug" is better than "The bug was fixed by us"
- Prefer short sentences; 1 idea = 1 sentence
- Lead with result, return early, make outcomes obvious.
- Cut clutter: delete redundant words in names and code.

Naming:
- Code is reference, history and functionality. It must be readable as a journal.
- Names must say what they mean, descriptive.
- Avoid vague terms: data, item, list, component.
- Example: `userPayment` instead of `userPaymentData`, `users` instead of `userList`.

Simplicity:
- Don’t over-engineer.
- Short > long, but not cryptic.
- Avoid puns.
- Example: `retryCount` vs `maximumNumberOfTimesToRetryBeforeGivingUpOnTheRequest`.

Brevity:
- Every character must earn its place.
- Remove redundancy: `Users` not `UserList`.
- Avoid suffixes like `Manager`, `Helper`, `Service` unless essential.
- Example: `users` vs `userListDataItems`.

Voice:
- Voice = consistency.
- Use one style per project.
- Keep it simple and professional.

Revision:
- First commit: make it work.
- Then refactor: rename, cut duplication, reorganize.
- Code review = editing.

Beginnings & Endings:
- File/module names set expectations.
- Functions must resolve clearly.

Specificity:
- Be concrete: `retryAfterMs` > `timeout`.
- `emailValidator` > `validator`.
- Specific names reduce misuse.