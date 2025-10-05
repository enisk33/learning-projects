# Learning Projects

This repository collects university-era and self-learning projects created while practicing programming, web development, game development, automation, and full-stack application architecture.

The projects are intentionally kept as a learning archive. Some folders are small tutorial-style exercises, while others are larger experiments that explore real application structure, UI flows, backend APIs, authentication, and Unity game scenes.

## Project Index

| Folder | Type | Summary |
| --- | --- | --- |
| `games/unity-car-game` | Unity / C# | A Unity car game practice project focused on input handling, custom editor scripts, scene setup, and Unity project structure. |
| `games/visual-programming-car-scene` | Unity / C# | A visual programming course-style Unity scene with car movement practice and scene configuration. |
| `web/html-js-practice` | HTML / CSS / JavaScript | Small browser exercises for calculator, stopwatch, digital clock, weather page, rock-paper-scissors, and layout practice. |
| `python/pycharm-practice` | Python | Beginner Python scripts and a small data scraping practice with a sample CSV output. |
| `java/idea-oop-practice` | Java | Object-oriented programming exercises covering classes, inheritance-like relationships, fractions, employees, managers, and simple console flows. |
| `dotnet/console-basics` | C# / .NET | Basic C# console application practice. |
| `web/next-job-tracker-landing` | Next.js / React | A job application tracker landing page exercise using Next.js App Router, Tailwind CSS, and reusable button variants. |
| `web/video-automation-dashboard` | Next.js / TypeScript | A video upload and social automation dashboard experiment with layered architecture, forms, validation, and UI components. |
| `web/social-automation-dashboard` | Next.js / Mantine | A social automation dashboard practice project with dashboard pages, auth screens, and platform action handlers. |
| `web/social-automation-auth-app` | Next.js / MongoDB / NextAuth | A more advanced social automation app with auth routes, MongoDB repositories, platform services, validation, rate limiting, and cleanup scripts. |
| `fullstack/ai-product-studio` | Django / DRF / Next.js | A full-stack AI product studio experiment with a Django REST backend, account/catalog/generation/order domains, and a Next.js frontend. |

## What I Practiced

- HTML, CSS, and vanilla JavaScript fundamentals.
- Java and C# basics for university programming coursework.
- Object-oriented design through small class-based exercises.
- Unity project structure, scenes, input scripts, and car movement logic.
- Next.js App Router, React components, TypeScript, Tailwind CSS, Mantine, and shadcn-style UI components.
- Authentication, validation, repository/service layers, and social platform integration experiments.
- Django REST Framework project organization with multiple application domains.

## Repository Notes

- Generated folders such as `node_modules`, `.next`, Unity `Library`, `Temp`, `Logs`, Python caches, and local databases are intentionally excluded.
- Some Unity third-party asset folders were not copied into this public archive to keep the repository lightweight and avoid publishing external asset packages.
- Several projects are learning snapshots rather than production-ready applications.

## Running Projects

Each project keeps its own dependencies and commands where applicable.

For Next.js projects:

```bash
npm install
npm run dev
```

For the Django backend in `fullstack/ai-product-studio`:

```bash
pip install -r requirements.txt
python backend/manage.py migrate
python backend/manage.py runserver
```

For Unity projects, open the project folder with a compatible Unity Editor version and allow Unity to regenerate `Library` and IDE project files.
