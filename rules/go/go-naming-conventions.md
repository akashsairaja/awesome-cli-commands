---
id: go-naming-conventions
stackId: go
type: rule
name: Go Naming Conventions
description: >-
  Follow Go's naming conventions strictly — MixedCaps for exports, mixedCaps for
  unexported, short receiver names, acronym casing, and meaningful package names
  without stuttering.
difficulty: beginner
globs:
  - '**/*.go'
  - '**/go.mod'
tags:
  - naming-conventions
  - mixed-caps
  - go-idioms
  - package-naming
  - code-style
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
  - tabnine
  - zed
faq:
  - question: Why does Go use MixedCaps instead of snake_case?
    answer: >-
      Go uses casing for visibility control: MixedCaps (exported/public) and
      mixedCaps (unexported/private). This is a language feature, not just
      convention — the compiler enforces it. Snake_case is never used for
      identifiers in Go. Acronyms are kept in all caps (HTTP, URL, ID) per Go
      conventions.
  - question: What is package name stuttering in Go and why avoid it?
    answer: >-
      Stuttering occurs when a type name repeats the package name:
      user.UserService. Since Go always uses qualified names, the package name
      provides context. Use user.Service instead — it reads naturally as 'a user
      Service'. This keeps names concise and idiomatic.
relatedItems:
  - go-error-handling
  - go-interface-design
  - go-formatting-gofmt
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Go Naming Conventions

## Rule
Follow Go's official naming conventions: MixedCaps for exported identifiers, mixedCaps for unexported, short meaningful names, and no package name stuttering.

## Naming Rules
| Element | Convention | Example |
|---------|-----------|---------|
| Exported | MixedCaps | `HTTPClient`, `UserService` |
| Unexported | mixedCaps | `httpClient`, `userCount` |
| Package | lowercase, single word | `http`, `user`, `auth` |
| Interface (single method) | Method + "er" | `Reader`, `Stringer` |
| Receiver | 1-2 letter abbreviation | `(s *Server)`, `(u *User)` |
| Acronyms | All caps | `ID`, `HTTP`, `URL`, `API` |

## Good Examples
```go
package user

// Exported types — MixedCaps, no package stuttering
type Service struct { ... }      // user.Service (not user.UserService)
type Repository interface { ... } // user.Repository

// Short receiver names
func (s *Service) Create(ctx context.Context, u *User) error {
    // ...
}

// Acronyms in all caps
type HTTPClient struct {
    baseURL string
    apiKey  string
    userID  string
}

// Interface naming
type Reader interface { Read(p []byte) (n int, err error) }
type Validator interface { Validate() error }

// Local variables — short, contextual
for i, v := range items { ... }
for _, u := range users { ... }
```

## Bad Examples
```go
// BAD: Package name stuttering
package user
type UserService struct { ... }  // user.UserService — redundant
type UserRepo struct { ... }     // user.UserRepo — redundant

// BAD: Wrong acronym casing
type HttpClient struct { ... }   // Should be HTTPClient
type UserId string               // Should be UserID
type ApiKey string               // Should be APIKey

// BAD: Long receiver names
func (service *UserService) GetUser() { ... }  // Should be (s *Service)
func (this *Server) Handle() { ... }           // Never use "this" or "self"

// BAD: Underscore in names
var user_name string   // Should be userName
func get_user() { ... } // Should be getUser
```

## Enforcement
- `gofmt` enforces formatting but not naming
- `golangci-lint` with revive rules catches naming issues
- Code review: verify package names do not stutter with type names
