---
id: git-tdd-green
stackId: git
type: skill
name: TDD Green Phase (Make Tests Pass)
description: >-
  Implement the minimal code needed to make failing tests pass in the TDD green
  phase.
difficulty: intermediate
tags:
  - git
  - tdd
  - green
  - phase
  - make
  - tests
  - pass
  - performance
compatibility:
  - claude-code
faq:
  - question: When should I use the TDD Green Phase (Make Tests Pass) skill?
    answer: >-
      Implement the minimal code needed to make failing tests pass in the TDD
      green phase. It includes practical examples for version control
      development.
  - question: What tools and setup does TDD Green Phase (Make Tests Pass) require?
    answer: >-
      Works with standard Git tooling (Git CLI, git hooks). No special setup
      required beyond a working version control environment.
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Green Phase: Simple function
def product_list(request):
    products = Product.objects.all()
    return JsonResponse({'products': list(products.values())})

# Refactor: Class-based view
class ProductListView(View):
    def get(self, request):
        products = Product.objects.all()
        return JsonResponse({'products': list(products.values())})

# Refactor: Generic view
class ProductListView(ListView):
    model = Product
    context_object_name = 'products'
```

### Express Patterns

**Inline → Middleware → Service Layer:**
```javascript
// Green Phase: Inline logic
app.post('/api/users', (req, res) => {
  const user = { id: Date.now(), ...req.body };
  users.push(user);
  res.json(user);
});

// Refactor: Extract middleware
app.post('/api/users', validateUser, (req, res) => {
  const user = userService.create(req.body);
  res.json(user);
});

// Refactor: Full layering
app.post('/api/users',
  validateUser,
  asyncHandler(userController.create)
);
```

## Use this skill when

- Moving from red to green in a TDD cycle
- Implementing minimal behavior to satisfy tests
- You want to keep implementation intentionally simple

## Do not use this skill when

- You are refactoring for design or performance
- Tests are already passing and you need new requirements
- You need a full architectural redesign

## Instructions

1. Review failing tests and identify the smallest fix.
2. Implement the minimal change to pass the next test.
3. Run tests after each change to confirm progress.
4. Record shortcuts or debt for the refactor phase.

## Safety

- Avoid bypassing tests to make them pass.
- Keep changes scoped to the failing behavior only.

