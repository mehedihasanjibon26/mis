
$ErrorActionPreference = "Stop"
Set-Location "E:\mis"

$path = (Resolve-Path ".\src\components\BangladeshLiveMap.tsx").Path
$utf8 = [System.Text.UTF8Encoding]::new($false)
$source = [System.IO.File]::ReadAllText($path, $utf8)

$marker = "MCBP_RAJSHahi_CLICK_FIX_V1"

if ($source.Contains($marker)) {
    Write-Host "Rajshahi fix already installed."
    exit 0
}

$startText = 'function findDivision(raw: string): Division | undefined {'
$endText = 'function colorFor('

$start = $source.IndexOf($startText)
$end = $source.IndexOf($endText, $start)

if ($start -lt 0 -or $end -le $start) {
    throw "Expected map function not found. No changes made."
}

$replacement = @'
/* MCBP_RAJSHahi_CLICK_FIX_V1 */
function findDivision(raw: string): Division | undefined {
  const normalized = normalize(raw)
    .replace(/division|bibhag|region|administrative/g, "")
    .replace(/^barisal$/, "barishal")
    .replace(/^chittagong$|^chattagram$|^chittagram$/, "chattogram")
    .replace(/^mymensing$/, "mymensingh");

  const aliases: Record<string, DivisionId> = {
    rajshahi: "Rajshahi",
    rajsahi: "Rajshahi",
    rajshai: "Rajshahi",
    rangpur: "Rangpur",
    dhaka: "Dhaka",
    khulna: "Khulna",
    sylhet: "Sylhet",
    barishal: "Barishal",
    mymensingh: "Mymensingh",
    chattogram: "Chattogram",
  };

  const matched = aliases[normalized];

  if (matched) {
    return divisions.find((d) => d.id === matched);
  }

  // Handle variations such as "Rajshahi Division".
  return divisions.find((d) => {
    const name = normalize(d.id);
    return normalized === name ||
      normalized.startsWith(name) ||
      normalized.endsWith(name);
  });
}
'@

$updated = $source.Substring(0, $start) +
    $replacement + "`r`n" +
    $source.Substring($end)

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backup = ".\project-audit\BangladeshLiveMap.before-rajshahi-$stamp.tsx.txt"

Copy-Item $path $backup -Force

[System.IO.File]::WriteAllText($path, $updated, $utf8)

Write-Host "SUCCESS: Division name matching updated." -ForegroundColor Green
Write-Host "Backup: $backup"
