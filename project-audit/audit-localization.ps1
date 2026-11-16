
$ErrorActionPreference = "Stop"
Set-Location "E:\mis"

$root = (Resolve-Path ".\src").Path
$output = ".\project-audit"
$utf8 = [System.Text.UTF8Encoding]::new($false)

New-Item -ItemType Directory -Force $output | Out-Null

$files = @(
    Get-ChildItem $root -Recurse -File |
    Where-Object {
        $_.Extension -in @(".tsx", ".ts", ".jsx", ".js")
    }
)

$patterns = @(
    @{
        Category = "ENGLISH_NUMBER_FORMAT"
        Pattern = 'toLocaleString\(\s*["'']en-US["'']'
    },
    @{
        Category = "ENGLISH_DATE_FORMAT"
        Pattern = 'toLocaleDateString\(\s*["'']en-US["'']|toLocaleTimeString\(\s*["'']en-US["'']'
    },
    @{
        Category = "UNCONTROLLED_NUMBER_FORMAT"
        Pattern = '\.toLocaleString\(\s*\)|\.toLocaleDateString\(\s*\)|\.toLocaleTimeString\(\s*\)'
    },
    @{
        Category = "ENGLISH_LOCALE_API"
        Pattern = 'Intl\.(NumberFormat|DateTimeFormat)\(\s*["'']en'
    },
    @{
        Category = "FIXED_NUMERIC_DISPLAY"
        Pattern = '>\s*[0-9][0-9,\.%/ ]+\s*<'
    },
    @{
        Category = "POSSIBLE_ENGLISH_JSX"
        Pattern = '>\s*[A-Za-z][A-Za-z0-9 ,&:/().%-]{3,}\s*<'
    },
    @{
        Category = "POSSIBLE_ENGLISH_PLACEHOLDER"
        Pattern = '(placeholder|title|aria-label)=["''][A-Za-z][^"'']+["'']'
    },
    @{
        Category = "POSSIBLE_ENGLISH_OPTION"
        Pattern = '<option[^>]*>\s*[A-Za-z][^<]*</option>'
    }
)

$findings = New-Object System.Collections.Generic.List[object]
$coverage = New-Object System.Collections.Generic.List[object]

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText(
        $file.FullName, $utf8
    )

    $relative = $file.FullName.Substring($root.Length + 1)
    $lines = $content -split '\r?\n'

    $hasLang = [regex]::IsMatch(
        $content,
        '\blang\b|useLanguage|useTranslation|useLocale|\bt\('
    )

    $hasBangla = [regex]::IsMatch(
        $content,
        '[\u0980-\u09FF]'
    )

    $coverage.Add([PSCustomObject]@{
        File = $relative
        LanguageAware = $hasLang
        ContainsBangla = $hasBangla
        Lines = $lines.Count
    })

    for ($i = 0; $i -lt $lines.Count; $i++) {
        foreach ($check in $patterns) {
            if ($lines[$i] -match $check.Pattern) {
                $findings.Add([PSCustomObject]@{
                    File = $relative
                    Line = $i + 1
                    Category = $check.Category
                    Code = $lines[$i].Trim()
                })
            }
        }
    }
}

$findings |
    Export-Csv "$output\localization-findings.csv" `
    -NoTypeInformation -Encoding UTF8

$coverage |
    Export-Csv "$output\localization-coverage.csv" `
    -NoTypeInformation -Encoding UTF8

$summary = New-Object System.Collections.Generic.List[string]

$summary.Add("MCBP-MIS FULL PLATFORM LOCALIZATION AUDIT")
$summary.Add("========================================")
$summary.Add("Source files scanned: $($files.Count)")
$summary.Add("Potential issues: $($findings.Count)")
$summary.Add("")
$summary.Add("CATEGORY COUNTS")

foreach ($group in ($findings | Group-Object Category | Sort-Object Name)) {
    $summary.Add("$($group.Name): $($group.Count)")
}

$summary.Add("")
$summary.Add("FILES WITHOUT DETECTED LANGUAGE HANDLING")

foreach ($item in $coverage) {
    if (-not $item.LanguageAware -and $item.File -like "*components*") {
        $summary.Add($item.File)
    }
}

$summary.Add("")
$summary.Add("DETAILED FINDINGS")

foreach ($item in $findings) {
    $summary.Add(
        "$($item.File):$($item.Line) [$($item.Category)]"
    )
    $summary.Add($item.Code)
    $summary.Add("")
}

[System.IO.File]::WriteAllLines(
    (Join-Path (Resolve-Path $output).Path "LOCALIZATION_AUDIT.txt"),
    [string[]]$summary,
    $utf8
)

Write-Host ""
Write-Host "LOCALIZATION AUDIT COMPLETE" -ForegroundColor Green
Write-Host "Scanned files: $($files.Count)"
Write-Host "Potential issues: $($findings.Count)"
Write-Host ""
Write-Host "Generated:"
Write-Host "$output\LOCALIZATION_AUDIT.txt"
Write-Host "$output\localization-findings.csv"
Write-Host "$output\localization-coverage.csv"
Write-Host ""
Write-Host "READ ONLY: No source files modified." -ForegroundColor Cyan
