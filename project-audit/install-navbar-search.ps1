
$ErrorActionPreference = "Stop"
Set-Location "E:\mis"

$path = (Resolve-Path ".\src\app\page.tsx").Path
$component = ".\src\components\NavbarSearch.tsx"
$utf8 = [System.Text.UTF8Encoding]::new($false)

if (-not (Test-Path $component)) {
    throw "NavbarSearch.tsx not found. Save it first."
}

$source = [System.IO.File]::ReadAllText($path, $utf8)
$marker = "MCBP_NAVBAR_SEARCH_V1"

if ($source.Contains($marker)) {
    Write-Host "Navbar search already integrated." -ForegroundColor Yellow
    exit 0
}

$importAnchor = 'import PerformanceTestPanel from "../components/PerformanceTestPanel";'

if (-not $source.Contains($importAnchor)) {
    throw "Import anchor missing. No changes made."
}

if (-not $source.Contains("const visibleSections = sections")) {
    throw "Visible sidebar sections not found."
}

$oldSearchPattern = '(?s)<div className="search">\s*<Search\b.*?</div>\s*(?=<div className="lang">)'

if ([regex]::Matches($source, $oldSearchPattern).Count -ne 1) {
    throw "Expected static navbar search block not found uniquely. No changes made."
}

$newSearch = @'
{/* MCBP_NAVBAR_SEARCH_V1 */}
        <NavbarSearch
          lang={lang}
          items={visibleSections.flatMap((section) =>
            section.items.map(([href, en, bn]) => ({
              href,
              en,
              bn,
              section: t(section.en, section.bn),
            }))
          )}
          onNavigate={navigate}
        />

'@

$updated = $source.Replace(
    $importAnchor,
    $importAnchor + "`r`n" +
    'import NavbarSearch from "../components/NavbarSearch";'
)

$updated = [regex]::Replace(
    $updated,
    $oldSearchPattern,
    [System.Text.RegularExpressions.MatchEvaluator]{
        param($match)
        return $newSearch
    }
)

if (-not $updated.Contains($marker) -or
    -not $updated.Contains("onNavigate={navigate}")) {
    throw "Integration validation failed. No changes made."
}

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backup = ".\src\app\page.before-search-$stamp.tsx.txt"

Copy-Item $path $backup

[System.IO.File]::WriteAllText(
    $path,
    $updated,
    $utf8
)

Write-Host "SUCCESS: Functional navbar search installed." -ForegroundColor Green
Write-Host "Backup: $backup"
