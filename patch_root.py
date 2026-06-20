import json

base_dir = "/Users/bobot/Documents/bobot.is-a.dev"

# 1. Update root package.json
with open(f"{base_dir}/package.json", "r") as f:
    pkg = json.load(f)

pkg["scripts"]["install:pack"] = "cd apps/perfect-pack && npm install"
pkg["scripts"]["dev:pack"] = "cd apps/perfect-pack && npm run dev"
pkg["scripts"]["build:pack"] = "cd apps/perfect-pack && npm run build"
pkg["scripts"]["deploy:local"] = "npm run build:app && rm -rf play/* && cp -R apps/moon-energy-crisis/dist/. play/ && npm run build:pack && rm -rf play-pack/* && mkdir -p play-pack && cp -R apps/perfect-pack/dist/. play-pack/"

with open(f"{base_dir}/package.json", "w") as f:
    json.dump(pkg, f, indent=2)

# 2. Update index.html to add Perfect Pack
with open(f"{base_dir}/index.html", "r") as f:
    index_html = f.read()

project_html = """
        <article class="project-card">
          <div class="project-meta">
            <span class="project-year">2026</span>
            <h3>
              <a href="/play-pack/" class="project-link" data-i18n="perfectPackTitle">
                Perfect Pack
              </a>
            </h3>
            <p data-i18n="perfectPackDescription">
              A high-paced spatial puzzle game. Drag, drop, and rotate items to perfectly fill your boxes before they roll away.
            </p>
            <div class="project-links">
              <a href="/play-pack/" class="button outline">
                <span data-i18n="playGame">Play Game</span>
                <svg width="18" height="18" viewBox="0 0 256 256" fill="currentColor">
                  <path d="M232.4,114.4l-144-88A15.9,15.9,0,0,0,64,40V216a15.9,15.9,0,0,0,24.4,13.6l144-88A15.9,15.9,0,0,0,232.4,114.4Z"></path>
                </svg>
              </a>
              <a href="https://github.com/clawbobot/clawbobot.github.io/tree/main/apps/perfect-pack">
                <span data-i18n="readSource">View Source</span>
                <svg width="18" height="18" viewBox="0 0 256 256" fill="currentColor">
                  <path d="M224,104a8,8,0,0,1-16,0V59.3L136.5,131.3a8,8,0,0,1-11.3-11.3L196.7,48H152a8,8,0,0,1,0-16h80a8,8,0,0,1,8,8Z"></path>
                  <path d="M216,152a8,8,0,0,1,8,8v48a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32H96a8,8,0,0,1,0,16H48V208H208V160A8,8,0,0,1,216,152Z"></path>
                </svg>
              </a>
            </div>
          </div>
          <div class="project-visual" style="background: var(--surface-strong); display: flex; align-items: center; justify-content: center;">
             <svg width="64" height="64" viewBox="0 0 256 256" fill="var(--green)"><path d="M223.7,73.4l-88-48.1a16.1,16.1,0,0,0-15.4,0l-88,48.1A15.8,15.8,0,0,0,24,87.3v81.4a15.8,15.8,0,0,0,8.3,13.9l88,48.1a16.1,16.1,0,0,0,15.4,0l88-48.1a15.8,15.8,0,0,0,8.3-13.9V87.3A15.8,15.8,0,0,0,223.7,73.4ZM128,40l76.7,42L128,124,51.3,82ZM40,168.7V101.1l80,43.7v81.9ZM136,226.7V144.8l80-43.7v67.6Z"></path></svg>
          </div>
        </article>
"""

# Insert project_html right after <div class="project-list">
index_html = index_html.replace('<div class="project-list">', '<div class="project-list">\n' + project_html)

# Add translations
index_html = index_html.replace(
    'moonEnergyTitle: "Moon Energy Crisis"',
    'perfectPackTitle: "Perfect Pack",\n        perfectPackDescription: "A high-paced spatial puzzle game. Drag, drop, and rotate items to perfectly fill your boxes before they roll away.",\n        moonEnergyTitle: "Moon Energy Crisis"'
)

index_html = index_html.replace(
    'moonEnergyTitle: "月球能源危机"',
    'perfectPackTitle: "极速打包专家",\n        perfectPackDescription: "一款快节奏的空间拼图游戏。在物品掉落前，将其拖拽、旋转并完美填满你的打包箱。",\n        moonEnergyTitle: "月球能源危机"'
)

with open(f"{base_dir}/index.html", "w") as f:
    f.write(index_html)
