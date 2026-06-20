import re

index_html_path = '/Users/bobot/Documents/bobot.is-a.dev/index.html'

with open(index_html_path, 'r', encoding='utf-8') as f:
    content = f.read()

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

# Replace in the HTML
if 'class="project-grid"' in content:
    content = content.replace('<div class="project-grid">', '<div class="project-grid">\n' + project_html)
    print("Patched successfully")
else:
    print("Could not find project-grid")

with open(index_html_path, 'w', encoding='utf-8') as f:
    f.write(content)

