
$ErrorActionPreference = "Stop"

Set-Location "E:\mis"

$pagePath = (Resolve-Path ".\src\app\page.tsx").Path
$cssPath = (Resolve-Path ".\src\app\globals.css").Path

$page = [System.IO.File]::ReadAllText($pagePath)
$css = [System.IO.File]::ReadAllText($cssPath)

$marker = "MCBP_LAYOUT_UPGRADE_23D_V1"

if ($page.Contains($marker) -or $css.Contains($marker)) {
    if ($page.Contains($marker) -and $css.Contains($marker)) {
        Write-Host "Layout upgrade already installed." -ForegroundColor Yellow
        exit 0
    }

    throw "Partial previous installation detected. No changes made."
}

# Validate source structure before modifying anything.
$profilePattern = '(?s)<div className="av">\{role\.initials\}</div>\s*<div className="who">\s*<b>\{t\(role\.en, role\.bn\)\}</b>\s*<span>\{role\.geo\}</span>\s*</div>'

if ([regex]::Matches($page, $profilePattern).Count -ne 1) {
    throw "Navbar profile anchor not uniquely found. No changes made."
}

$required = @(
    'function updateRole(nextRole: string)',
    'const roles = [',
    'className="top"',
    'className={mobileOpen ? "side open" : "side"}',
    'className="content"',
    'className="lang"'
)

foreach ($item in $required) {
    if (-not $page.Contains($item)) {
        throw "Missing source anchor: $item"
    }
}

# The existing role change function remains unchanged.
# New selector calls updateRole() directly.

$profileReplacement = @'
{/* MCBP_LAYOUT_UPGRADE_23D_V1 */}
          <details className="top-role-dropdown">
            <summary className="top-role-trigger" aria-label="Switch demo role">
              <div className="av">{role.initials}</div>
              <div className="who">
                <b>{t(role.en, role.bn)}</b>
                <span>{role.geo}</span>
              </div>
              <span className="top-role-chevron">âŒ„</span>
            </summary>

            <div className="top-role-options">
              <div className="top-role-heading">
                {t("Switch demo role", "à¦¡à§‡à¦®à§‹ à¦°à§‹à¦² à¦ªà¦°à¦¿à¦¬à¦°à§à¦¤à¦¨ à¦•à¦°à§à¦¨")}
              </div>
              {roles.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={
                    roleId === item.id
                      ? "top-role-option active"
                      : "top-role-option"
                  }
                  onClick={(event) => {
                    updateRole(item.id);
                    event.currentTarget.closest("details")?.removeAttribute("open");
                  }}
                >
                  <span className="top-role-option-initials">
                    {item.initials}
                  </span>
                  <span className="top-role-option-text">
                    <strong>{t(item.en, item.bn)}</strong>
                    <small>{item.geo}</small>
                  </span>
                  {roleId === item.id && <span>âœ“</span>}
                </button>
              ))}
            </div>
          </details>
'@

$updatedPage = [regex]::Replace(
    $page,
    $profilePattern,
    [System.Text.RegularExpressions.MatchEvaluator]{
        param($match)
        return $profileReplacement
    }
)

$layoutCSS = @'

/* MCBP_LAYOUT_UPGRADE_23D_V1
   Fixed navbar + independent sidebar and main content scroll.
   This affects the dashboard shell, not module data.
*/

html,
body {
  height: 100%;
}

body {
  overflow: hidden;
}

.app {
  display: flex !important;
  flex-direction: column !important;
  height: 100vh !important;
  height: 100dvh !important;
  min-height: 0 !important;
  overflow: hidden !important;
}

.app > .top {
  position: relative !important;
  inset: auto !important;
  flex: 0 0 auto !important;
  width: 100%;
  z-index: 100 !important;
  box-sizing: border-box;
}

.app > .main {
  display: flex !important;
  flex: 1 1 auto !important;
  min-height: 0 !important;
  height: auto !important;
  max-height: none !important;
  overflow: hidden !important;
}

.app > .main > .side {
  flex-shrink: 0;
  align-self: stretch;
  height: 100% !important;
  min-height: 0 !important;
  max-height: 100% !important;
  overflow-x: hidden !important;
  overflow-y: auto !important;
  overscroll-behavior-y: contain;
  scrollbar-width: thin;
  scrollbar-color: #89b5a1 transparent;
}

.app > .main > .content {
  flex: 1 1 auto !important;
  min-width: 0 !important;
  height: 100% !important;
  min-height: 0 !important;
  max-height: 100% !important;
  overflow-x: hidden !important;
  overflow-y: auto !important;
  overscroll-behavior-y: contain;
  scrollbar-width: thin;
}

/* Navbar utility group on the far right */

.app > .top .search {
  min-width: 0;
}

.app > .top .lang {
  margin-left: auto !important;
  flex-shrink: 0;
}

.app > .top .top-role-dropdown {
  position: relative;
  flex: 0 0 auto;
  z-index: 110;
}

.top-role-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  list-style: none;
  padding: 5px 9px;
  border-radius: 12px;
  transition: background 0.15s ease;
}

.top-role-trigger::-webkit-details-marker {
  display: none;
}

.top-role-trigger:hover,
.top-role-dropdown[open] > .top-role-trigger {
  background: rgba(255,255,255,0.12);
}

.top-role-trigger .av {
  flex-shrink: 0;
}

.top-role-trigger .who {
  min-width: 0;
}

.top-role-trigger .who b,
.top-role-trigger .who span {
  display: block;
  white-space: nowrap;
}

.top-role-chevron {
  color: #dcf5e8;
  font-size: 20px;
  margin-left: 2px;
}

.top-role-options {
  position: absolute;
  right: 0;
  top: calc(100% + 12px);
  width: 325px;
  max-width: calc(100vw - 24px);
  max-height: min(68vh, 510px);
  overflow-y: auto;
  z-index: 300;
  background: #fff;
  color: #173f2d;
  border: 1px solid #d7e8dd;
  border-radius: 15px;
  box-shadow: 0 18px 55px rgba(8,37,26,0.20);
  padding: 9px;
}

.top-role-heading {
  color: #6e8274;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 12px 10px;
}

.top-role-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  border: 0;
  background: transparent;
  color: #193e2d;
  border-radius: 10px;
  padding: 10px;
  text-align: left;
  cursor: pointer;
}

.top-role-option:hover,
.top-role-option.active {
  background: #eaf6ee;
}

.top-role-option-initials {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  min-width: 34px;
  border-radius: 50%;
  background: #d9eee2;
  color: #066543;
  font-size: 11px;
  font-weight: 800;
}

.top-role-option-text {
  flex: 1;
  min-width: 0;
}

.top-role-option-text strong {
  display: block;
  font-size: 12px;
  line-height: 1.5;
}

.top-role-option-text small {
  display: block;
  color: #7b8b80;
  font-size: 10px;
  margin-top: 2px;
}

/* Mobile keeps the existing hamburger/overlay behaviour. */

@media (max-width: 767px) {
  .app > .top {
    gap: 7px;
  }

  .app > .top .search {
    display: none;
  }

  .top-role-trigger {
    gap: 6px;
    padding: 4px;
  }

  .top-role-trigger .who {
    display: none;
  }

  .top-role-chevron {
    display: none;
  }

  .top-role-options {
    right: 0;
    width: min(315px, calc(100vw - 24px));
  }

  .app > .main > .side {
    max-height: 100% !important;
  }
}

'@

# Backups for both affected files.
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$pageBackup = ".\src\app\page.before-layout-$stamp.tsx.txt"
$cssBackup = ".\src\app\globals.before-layout-$stamp.css.txt"

Copy-Item $pagePath $pageBackup
Copy-Item $cssPath $cssBackup

# Both inputs are validated; now write.
[System.IO.File]::WriteAllText(
    $pagePath,
    $updatedPage,
    [System.Text.UTF8Encoding]::new($false)
)

[System.IO.File]::WriteAllText(
    $cssPath,
    $css + $layoutCSS,
    [System.Text.UTF8Encoding]::new($false)
)

Write-Host ""
Write-Host "SUCCESS: Dashboard layout upgrade installed." -ForegroundColor Green
Write-Host "Page backup: $pageBackup"
Write-Host "CSS backup: $cssBackup"
Write-Host "Navbar role dropdown installed."
Write-Host "Sidebar and content now have separate scroll containers."
