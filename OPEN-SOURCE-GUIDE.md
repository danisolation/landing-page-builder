# Hướng dẫn đóng góp Open Source

> Từ A đến Z: cách tìm project, đọc code, tạo issue, gửi PR, và trở thành contributor.

---

## Tại sao nên đóng góp Open Source?

```
Lợi ích:
├── Học hỏi code từ developers giỏi
├── Portfolio ấn tượng (GitHub contribution graph)
├── Networking (kết nối với developers khác)
├── Hiểu codebase thực tế (không phải tutorial)
├── Practice Git workflow chuyên nghiệp
└── Cơ hội việc làm (recruiters check GitHub)
```

---

## Bước 1: Tìm project phù hợp

### Tiêu chí chọn project

```
✅ Nên chọn:
├── Bạn đang SỬ DỤNG project đó (biết nó làm gì)
├── Có label "good first issue" hoặc "beginner-friendly"
├── Documentation đầy đủ (README, CONTRIBUTING.md)
├── Maintainers phản hồi nhanh (check recent issues/PRs)
├── Ngôn ngữ bạn biết (TypeScript, JavaScript)
└── Size phù hợp (không quá lớn cho beginner)

❌ Tránh:
├── Project quá lớn (React, Next.js) — khó cho beginner
├── Project không active (last commit 2+ years)
├── Maintainers không phản hồi
└── Không có documentation
```

### Nơi tìm

```
1. GitHub Topics
   https://github.com/topics/typescript
   https://github.com/topics/react

2. Good First Issues
   https://goodfirstissue.dev/
   https://goodfirstissues.com/
   https://github.com/topics/good-first-issue

3. Projects bạn đang dùng
   - Library yêu thích → check Issues tab
   - Tools bạn dùng hàng ngày → check CONTRIBUTING.md

4. Hacktoberfest (tháng 10 hàng năm)
   https://hacktoberfest.com/
```

---

## Bước 2: Đọc code và hiểu project

### Quy trình đọc code

```
1. Đọc README.md
   ├── Project làm gì?
   ├── Tech stack?
   ├── Cách cài đặt?
   └── Cách chạy?

2. Đọc CONTRIBUTING.md
   ├── Quy trình đóng góp
   ├── Code style
   ├── Branch naming
   └── PR template

3. Cấu trúc thư mục
   src/
   ├── components/    ← UI components
   ├── hooks/         ← Custom hooks
   ├── lib/           ← Utilities
   └── types/         ← TypeScript types

4. Chạy project locally
   ├── Clone repo
   ├── Install dependencies
   ├── Run dev server
   └── Chơi thử (play around)

5. Đọc code liên quan đến issue bạn muốn fix
   ├── Tìm file liên quan
   ├── Đọc function/component
   ├── Hiểu flow
   └── Tìm chỗ cần sửa
```

### Tips đọc code hiệu quả

```
1. Start from entry point
   - Next.js: app/layout.tsx → app/page.tsx
   - NestJS: main.ts → app.module.ts

2. Follow the data flow
   - User action → Component → Hook → API → Service → DB

3. Use "Go to Definition" (VS Code)
   - Ctrl+Click vào function → nhảy đến definition
   - Tìm hiểu function đó làm gì

4. Use "Find References"
   - Right-click → Find All References
   - Tìm hiểu function được dùng ở đâu

5. Đọc tests
   - Tests mô tả behavior của code
   - Nếu không có test → cơ hội đóng góp!
```

---

## Bước 3: Tạo Issue

### Khi nào nên tạo Issue?

```
Tạo Issue khi:
├── Tìm thấy bug (code không hoạt động đúng)
├── Có suggestion (cải thiện feature)
├── Documentation thiếu/sai
├── Question (không hiểu cách dùng)
└── Security vulnerability (báo cáo riêng)
```

### Issue Template

```markdown
## Bug Report

### Mô tả
[Mô tả ngắn gọn về bug]

### Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

### Expected Behavior
[Bạn mong đợi gì xảy ra]

### Actual Behavior
[Thực tế xảy ra gì]

### Screenshots
[ Nếu có ]

### Environment
- OS: Windows 11
- Browser: Chrome 120
- Node.js: 20.x
- Package version: 1.2.3
```

---

## Bước 4: Fork & Clone

### Fork là gì?

```
Original repo: github.com/owner/project
                    │
                    │ Fork (copy)
                    ▼
Your fork: github.com/your-username/project
                    │
                    │ Clone (download)
                    ▼
Local: ~/projects/project/
```

### Commands

```bash
# 1. Fork trên GitHub (click nút Fork)

# 2. Clone fork về máy
git clone https://github.com/your-username/project.git
cd project

# 3. Thêm upstream (repo gốc)
git remote add upstream https://github.com/owner/project.git

# 4. Verify
git remote -v
# origin    https://github.com/your-username/project.git (fetch)
# origin    https://github.com/your-username/project.git (push)
# upstream  https://github.com/owner/project.git (fetch)
# upstream  https://github.com/owner/project.git (push)
```

---

## Bước 5: Tạo Branch

### Branch Naming Convention

```
Format: <type>/<short-description>

Types:
├── feat/     ← New feature
├── fix/      ← Bug fix
├── docs/     ← Documentation
├── style/    ← Code style (formatting)
├── refactor/ ← Code refactoring
├── test/     ← Adding tests
└── chore/    ← Maintenance

Ví dụ:
feat/add-dark-mode
fix/login-redirect-bug
docs/update-readme
refactor/extract-hooks
```

### Commands

```bash
# 1. Sync với upstream
git fetch upstream
git checkout main
git merge upstream/main

# 2. Tạo branch mới
git checkout -b feat/add-dark-mode

# 3. Code changes...

# 4. Commit
git add .
git commit -m "feat: add dark mode toggle"

# 5. Push
git push origin feat/add-dark-mode
```

---

## Bước 6: Tạo Pull Request (PR)

### PR Template

```markdown
## Description
[Mô tả ngắn gọn về thay đổi]

## Related Issue
Closes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Changes Made
- [ ] Change 1
- [ ] Change 2
- [ ] Change 3

## Testing
- [ ] Tested locally
- [ ] All tests pass
- [ ] Added new tests (if applicable)

## Screenshots (if applicable)
[ Before/After screenshots ]

## Checklist
- [ ] Code follows project style
- [ ] Self-reviewed code
- [ ] Commented hard-to-understand areas
- [ ] Updated documentation
- [ ] No new warnings
```

### PR Best Practices

```
✅ Nên:
├── PR nhỏ (dễ review)
├── Mô tả rõ ràng
├── Link related issue
├── Screenshots (nếu thay đổi UI)
├── Tests pass
└── Respond to review comments

❌ Tránh:
├── PR quá lớn (khó review)
├── Mô tả sơ sài
├── Không link issue
├── Ignore review comments
└── Force push sau khi review
```

---

## Bước 7: Code Review

### Khi review code của người khác

```
Tìm hiểu:
├── Code có hoạt động đúng không?
├── Có edge case nào bỏ sót không?
├── Code có readable không?
├── Có performance issue không?
├── Có security issue không?
└── Tests có đầy đủ không?

Phản hồi:
├── Constructive (xây dựng, không chê bai)
├── Specific (chỉ ra cụ thể chỗ nào)
├── Suggest solution (không chỉ ra lỗi)
└── Praise good code (khen code tốt)
```

### Khi nhận review

```
1. Đọc kỹ review comments
2. Hiểu tại sao reviewer suggest
3. Nếu đồng ý → sửa code
4. Nếu không đồng ý → giải thích lý do
5. Push fix mới (không force push)
6. Reply "Done" cho mỗi comment đã fix
```

---

## Bước 8: Git Workflow chuyên nghiệp

### Conventional Commits

```
Format: <type>(<scope>): <description>

Types:
├── feat:     New feature
├── fix:      Bug fix
├── docs:     Documentation
├── style:    Code style (formatting, no logic change)
├── refactor: Code refactoring (no feature/fix)
├── test:     Adding tests
├── chore:    Maintenance
└── perf:     Performance improvement

Ví dụ:
feat(auth): add JWT refresh token
fix(pages): fix slug validation regex
docs(readme): update installation guide
refactor(hooks): extract useDebounce hook
test(pages): add unit tests for PagesService
```

### Branch Strategy

```
main (production)
 │
 ├── develop (development)
 │    │
 │    ├── feat/add-dark-mode
 │    ├── fix/login-bug
 │    └── docs/update-readme
 │
 └── release/v1.0.0
```

### Sync fork với upstream

```bash
# Trước khi tạo branch mới
git fetch upstream
git checkout main
git merge upstream/main
git push origin main

# Tạo branch mới từ main mới nhất
git checkout -b feat/new-feature
```

---

## Common Git Commands

```bash
# Status
git status                    # Xem trạng thái
git log --oneline -10         # Xem 10 commits gần nhất
git diff                      # Xem thay đổi chưa commit

# Branch
git branch                    # Xem branches
git branch -a                 # Xem tất cả branches (kể cả remote)
git checkout -b <branch>      # Tạo và switch branch
git checkout <branch>         # Switch branch
git branch -d <branch>        # Xóa branch local

# Commit
git add .                     # Stage all changes
git add <file>                # Stage file cụ thể
git commit -m "message"       # Commit
git commit --amend            # Sửa commit gần nhất

# Push/Pull
git push origin <branch>      # Push branch
git pull upstream main        # Pull từ upstream
git push --force              # Force push (⚠️ cẩn thận!)

# Stash (tạm giữ changes)
git stash                     # Stash changes
git stash pop                 # Apply stash
git stash list                # Xem stash list

# Undo
git checkout -- <file>        # Undo changes trong file
git reset HEAD~1              # Undo commit gần nhất (giữ changes)
git reset --hard HEAD~1       # Undo commit gần nhất (mất changes) ⚠️
```

---

## Ví dụ thực tế: Đóng góp cho dự án này

### Scenario: Thêm error.tsx cho route /pages/new

```
1. Fork repo
   → github.com/your-username/landing-page-builder

2. Clone
   git clone https://github.com/your-username/landing-page-builder.git

3. Tạo branch
   git checkout -b feat/add-error-boundary-pages-new

4. Tạo file
   landing-page-fe/src/app/[locale]/pages/new/error.tsx

5. Code error boundary component

6. Test
   npm run build  ← Đảm bảo không có type error

7. Commit
   git add .
   git commit -m "feat(pages): add error boundary for /pages/new route"

8. Push
   git push origin feat/add-error-boundary-pages-new

9. Tạo PR trên GitHub
   → Mô tả rõ ràng, link issue (nếu có)

10. Đợi review, respond feedback

11. Merge 🎉
```

---

## Resources

| Resource | Link | Mô tả |
|---|---|---|
| GitHub Docs | https://docs.github.com | Hướng dẫn GitHub |
| Git Handbook | https://guides.github.com/introduction/git-handbook/ | Git basics |
| Conventional Commits | https://www.conventionalcommits.org/ | Commit format |
| First Contributions | https://firstcontributions.github.io/ | Hướng dẫn step-by-step |
| Open Source Guide | https://opensource.guide/ | GitHub's OSS guide |
| Codecademy Git | https://www.codecademy.com/learn/learn-git | Interactive Git course |
