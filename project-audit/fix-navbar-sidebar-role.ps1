
$ErrorActionPreference = "Stop"

Set-Location "E:\mis"

$pagePath = (Resolve-Path ".\src\app\page.tsx").Path
$cssPath = (Resolve-Path ".\src\app\globals.css").Path

$utf8 = [System.Text.UTF8Encoding]::new($false)

$page = [System.IO.File]::ReadAllText($pagePath, $utf8)
$css = [System.IO.File]::ReadAllText($cssPath, $utf8)

$marker = "MCBP_FIXED_SHELL_V2"

if ($page.Contains($marker) -and $css.Contains($marker)) {
    Write-Host "Layout V2 already installed." -ForegroundColor Yellow
    exit 0
}

if ($page.Contains($marker) -or $css.Contains($marker)) {
    throw "Partial installation detected. No files modified."
}

# Check original navbar profile.
$profilePattern = '(?s)<div className="av">\{role\.initials\}</div>\s*<div className="who">\s*<b>\{t\(role\.en, role\.bn\)\}</b>\s*<span>\{role\.geo\}</span>\s*</div>'

if ([regex]::Matches($page, $profilePattern).Count -ne 1) {
    throw "Original navbar profile not uniquely found. No changes made."
}

$required = @(
    'const roles = [',
    'function updateRole(nextRole: string)',
    'className="top"',
    'className={mobileOpen ? "side open" : "side"}',
    'className="content"'
)

foreach ($anchor in $required) {
    if (-not $page.Contains($anchor)) {
        throw "Missing expected anchor: $anchor"
    }
}

# No Unicode symbol is used for the dropdown arrow.
# CSS will draw the arrow.

$profile = @'
{/* MCBP_FIXED_SHELL_V2 */}
          <details className="mcbp-profile-menu">
            <summary
              className="mcbp-profile-trigger"
              aria-label="Switch demo role"
            >
              <div className="av">{role.initials}</div>
              <div className="who">
                <b>{t(role.en, role.bn)}</b>
                <span>{role.geo}</span>
              </div>
              <span
                className="mcbp-profile-arrow"
                aria-hidden="true"
              />
            </summary>

            <div className="mcbp-role-list">
              <div className="mcbp-role-title">
                {t("Switch demo role", "Role selection")}
              </div>

              {roles.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={
                    roleId === item.id
                      ? "mcbp-role-item selected"
                      : "mcbp-role-item"
                  }
                  onClick={(event) => {
                    updateRole(item.id);
                    event.currentTarget
                      .closest("details")
                      ?.removeAttribute("open");
                  }}
                >
                  <span className="mcbp-role-avatar">
                    {item.initials}
                  </span>
                  <span className="mcbp-role-description">
                    <strong>{t(item.en, item.bn)}</strong>
                    <small>{item.geo}</small>
                  </span>
                  {roleId === item.id && (
                    <span className="mcbp-role-check">
                      &#10003;
                    </span>
                  )}
                </button>
              ))}
            </div>
          </details>
'@

$pageUpdated = [regex]::Replace(
    $page,
    $profilePattern,
    [System.Text.RegularExpressions.MatchEvaluator]{
        param($match)
        return $profile
    }
)

# Remove previous V1 layout CSS if it exists.
# This prevents conflicting role dropdown and scrolling rules.
$oldMarker = "/* MCBP_LAYOUT_UPGRADE_23D_V1"
$oldStart = $css.IndexOf($oldMarker)

if ($oldStart -ge 0) {
    $css = $css.Substring(0, $oldStart)
    Write-Host "Previous V1 layout CSS replaced by V2."
}

$cssAddon = @'

/* MCBP_FIXED_SHELL_V2 */

/* Fixed application frame */
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

/* Navbar remains visible while content scrolls */
.app > .top {
  position: relative !important;
  top: auto !important;
  left: auto !important;
  right: auto !important;
  flex: 0 0 auto !important;
  width: 100% !important;
  box-sizing: border-box !important;
  z-index: 200 !important;
}

/* Main shell stays below navbar */
.app > .main {
  display: flex !important;
  flex: 1 1 auto !important;
  height: auto !important;
  min-height: 0 !important;
  max-height: none !important;
  overflow: hidden !important;
}

/* Sidebar has its own scroll area */
.app > .main > .side {
  flex-shrink: 0 !important;
  align-self: stretch !important;
  height: 100% !important;
  min-height: 0 !important;
  max-height: 100% !important;
  overflow-x: hidden !important;
  overflow-y: auto !important;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: #8cbaa3 transparent;
}

/* Right-side content scrolls separately */
.app > .main > .content {
  flex: 1 1 auto !important;
  min-width: 0 !important;
  height: 100% !important;
  min-height: 0 !important;
  max-height: 100% !important;
  overflow-x: hidden !important;
  overflow-y: auto !important;
  overscroll-behavior: contain;
  scrollbar-width: thin;
}

/* Right-aligned navbar utilities */
.app > .top .lang {
  margin-left: auto !important;
  flex-shrink: 0;
}

.app > .top .mcbp-profile-menu {
  position: relative;
  flex-shrink: 0;
  margin-left: 0;
}

.mcbp-profile-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 12px;
  padding: 5px 9px;
  cursor: pointer;
  list-style: none;
}

.mcbp-profile-trigger::-webkit-details-marker {
  display: none;
}

.mcbp-profile-trigger:hover,
.mcbp-profile-menu[open] > .mcbp-profile-trigger {
  background: rgba(255,255,255,0.12);
}

/* Pure CSS down arrow: no text encoding problem */
.mcbp-profile-arrow {
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid #d6f5e6;
  margin-left: 5px;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.mcbp-profile-menu[open] .mcbp-profile-arrow {
  transform: rotate(180deg);
}

/* Role selector dropdown */
.mcbp-role-list {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 330px;
  max-width: calc(100vw - 20px);
  max-height: min(65vh, 510px);
  overflow-y: auto;
  padding: 9px;
  background: #ffffff;
  color: #143c2b;
  border: 1px solid #dcebe0;
  border-radius: 15px;
  box-shadow: 0 18px 50px rgba(0,34,19,0.22);
  z-index: 1000;
}

.mcbp-role-title {
  padding: 12px;
  color: #637d6c;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.mcbp-role-item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 11px;
  padding: 10px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #183f2d;
  cursor: pointer;
  text-align: left;
}

.mcbp-role-item:hover,
.mcbp-role-item.selected {
  background: #e9f6ed;
}

.mcbp-role-avatar {
  display: grid;
  place-items: center;
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #d7eee1;
  color: #076445;
  font-size: 11px;
  font-weight: 800;
}

.mcbp-role-description {
  flex: 1;
  min-width: 0;
}

.mcbp-role-description strong {
  display: block;
  font-size: 12px;
  line-height: 1.5;
}

.mcbp-role-description small {
  display: block;
  margin-top: 3px;
  font-size: 10px;
  color: #738779;
}

.mcbp-role-check {
  color: #087b54;
  font-weight: 800;
}

/* Responsive shell */
@media (max-width: 767px) {
  .app > .top .search {
    display: none !important;
  }

  .mcbp-profile-trigger {
    gap: 6px;
    padding: 4px;
  }

  .mcbp-profile-trigger .who {
    display: none;
  }

  .mcbp-role-list {
    right: 0;
    width: min(320px, calc(100vw - 20px));
  }

  /* Keep the existing mobile sidebar overlay behaviour */
  .app > .main > .side {
    height: 100% !important;
    max-height: 100% !important;
  }
}

'@

$cssUpdated = $css + $cssAddon

# Validate content before changing files.
if (-not $pageUpdated.Contains('mcbp-profile-menu')) {
    throw "Profile replacement validation failed."
}

if (-not $pageUpdated.Contains('updateRole(item.id)')) {
    throw "Role switching validation failed."
}

if (-not $cssUpdated.Contains($marker)) {
    throw "CSS validation failed."
}

# Back up current files.
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"

$pageBackup = ".\src\app\page.before-fixed-shell-$stamp.tsx.txt"
$cssBackup = ".\src\app\globals.before-fixed-shell-$stamp.css.txt"

Copy-Item $pagePath $pageBackup -Force
Copy-Item $cssPath $cssBackup -Force

# UTF-8, no BOM. Original Bangla characters are preserved.
[System.IO.File]::WriteAllText(
    $pagePath,
    $pageUpdated,
    $utf8
)

[System.IO.File]::WriteAllText(
    $cssPath,
    $cssUpdated,
    $utf8
)

Write-Host ""
Write-Host "SUCCESS: Fixed navbar and independent scrolling installed." -ForegroundColor Green
Write-Host "SUCCESS: Role dropdown installed in navbar." -ForegroundColor Green
Write-Host "SUCCESS: CSS-only arrow installed." -ForegroundColor Green
Write-Host "Page backup: $pageBackup"
Write-Host "CSS backup: $cssBackup"
