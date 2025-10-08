# RunShoes Project

## Stack
- Frontend: Next.js 15 + TypeScript  
- Backend: NestJS  
- Database: PostgreSQL (Docker)  
- ORM: Prisma (tomorrow)

## Getting Started

### Start database
```bash
cd infra
docker compose up -d

### Run backend
cd backend
pnpm start:dev

### Run frontend
cd frontend
pnpm dev


Save (`Ctrl+O`, `Enter`, `Ctrl+X`).

---

## 🗂️ Step 9 — Push to GitHub

```bash
cd ~/runshoes
git add .
git commit -m "Day 1 complete: base architecture & setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/runshoes.git
git push -u origin main


