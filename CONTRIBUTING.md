# Contributing to ANTON

Thank you for considering a contribution! Here's how to get started.

## Reporting Bugs

Before opening an issue, please:
1. Search [existing issues](https://github.com/Ares19v/Anton/issues) to avoid duplicates.
2. Include the steps to reproduce, expected vs. actual behaviour, and your OS/Python/Node versions.

## Suggesting Features

Open a [GitHub Discussion](https://github.com/Ares19v/Anton/discussions) or an issue tagged **`enhancement`**. Describe the use-case and why it would benefit other users.

## Development Setup

```bash
# 1 — Fork & clone
git clone https://github.com/<your-username>/Anton.git
cd Anton

# 2 — Backend
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # Fill in your GROQ_API_KEY & SECRET_KEY
python download_data.py
uvicorn app.main:app --reload

# 3 — Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Pull Requests

1. Create a feature branch: `git checkout -b feat/your-feature-name`
2. Write clear, focused commits following the Conventional Commits format:
   - `feat: add CSV export`
   - `fix: handle empty PDF pages`
   - `docs: update setup instructions`
3. Ensure `uvicorn app.main:app --reload` starts without errors.
4. Open a PR targeting the `main` branch with a description of **what** and **why**.

## Code Style

- **Python:** Follow PEP 8. Docstrings on all public functions.
- **JavaScript:** Prettier defaults (single quotes, 2-space indent).
- Keep PRs small and focused — one logical change per PR.

## License

By contributing you agree that your contributions will be licensed under the [MIT License](LICENSE).
