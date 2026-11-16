
$ErrorActionPreference = "Stop"
Set-Location "E:\mis"

$utf8 = [System.Text.UTF8Encoding]::new($false)

$pagePath = (Resolve-Path ".\src\app\page.tsx").Path
$componentPath = Join-Path (Get-Location).Path "src\components\GlobalNumberLocalization.tsx"

$page = [System.IO.File]::ReadAllText($pagePath, $utf8)

$marker = "MCBP_GLOBAL_NUMBER_LOCALIZATION_V1"

if ($page.Contains($marker)) {
    Write-Host "Global number localization already installed." -ForegroundColor Yellow
    exit 0
}

$anchor = 'import { useEffect, useState } from "react";'

if (-not $page.Contains($anchor)) {
    throw "React import anchor missing. No changes made."
}

$rootPattern = '(<div className=\{lang === "bn" \? "app bn" : "app"\}>)'

if ([regex]::Matches($page, $rootPattern).Count -ne 1) {
    throw "Dashboard root not found uniquely. No changes made."
}

if (Test-Path $componentPath) {
    throw "Component already exists. No changes made to avoid overwrite."
}

$component = @'
"use client";

import { useEffect } from "react";

type Language = "en" | "bn";

type CachedText = {
  original: string;
  localized: string;
};

const originalTexts = new WeakMap<Text, CachedText>();

const bengaliDigits = [
  "\u09E6", "\u09E7", "\u09E8", "\u09E9", "\u09EA",
  "\u09EB", "\u09EC", "\u09ED", "\u09EE", "\u09EF",
];

function toBengaliDigits(value: string): string {
  return value.replace(/[0-9]/g, (digit) => {
    return bengaliDigits[Number(digit)];
  });
}

function localizeDisplayText(value: string): string {
  // Convert independent numeric displays.
  // Keep technical identifiers, URLs, IPs and codes intact.
  return value.replace(
    /(?<![A-Za-z0-9_./:@-])\d+(?:,\d{3})*(?:\.\d+)?(?![A-Za-z0-9_./:@-])/g,
    (match) => toBengaliDigits(match)
  );
}

function isProtected(node: Text): boolean {
  const parent = node.parentElement;

  if (!parent) return true;

  if (
    parent.closest(
      [
        "script",
        "style",
        "code",
        "pre",
        "kbd",
        "textarea",
        "input",
        "select",
        "option",
        "[contenteditable]",
        "[data-number-l10n-ignore]",
      ].join(",")
    )
  ) {
    return true;
  }

  const value = node.nodeValue ?? "";

  // Preserve URLs and email addresses.
  if (/https?:\/\/|www\.|[\w.+-]+@[\w.-]+\.\w+/.test(value)) {
    return true;
  }

  // Preserve OTP/MFA display examples.
  if (/^\s*\d{6}\s*$/.test(value)) {
    const context = parent.parentElement?.textContent ?? "";
    if (/\b(OTP|MFA|PIN|verification code)\b/i.test(context)) {
      return true;
    }
  }

  return false;
}

function updateTextNode(node: Text, lang: Language): void {
  if (isProtected(node)) return;

  const current = node.nodeValue ?? "";
  const cached = originalTexts.get(node);

  if (lang === "bn") {
    // React might have rendered a new value.
    // In that case, treat it as the new original.
    const original =
      cached && current === cached.localized
        ? cached.original
        : current;

    const localized = localizeDisplayText(original);

    originalTexts.set(node, { original, localized });

    if (current !== localized) {
      node.nodeValue = localized;
    }
  } else {
    if (cached && current === cached.localized) {
      if (current !== cached.original) {
        node.nodeValue = cached.original;
      }
    }

    originalTexts.delete(node);
  }
}

function visit(node: Node, lang: Language): void {
  if (node.nodeType === Node.TEXT_NODE) {
    updateTextNode(node as Text, lang);
    return;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return;

  const element = node as Element;

  if (
    element.matches(
      "script,style,code,pre,kbd,textarea,input,select,option,[contenteditable],[data-number-l10n-ignore]"
    )
  ) {
    return;
  }

  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT
  );

  let current: Node | null = walker.nextNode();

  while (current) {
    updateTextNode(current as Text, lang);
    current = walker.nextNode();
  }
}

export default function GlobalNumberLocalization({
  lang,
}: {
  lang: Language;
}) {
  useEffect(() => {
    const root = document.querySelector(".app");

    if (!root) return;

    // Initial scan, including nested module content.
    visit(root, lang);

    // Handles module navigation, data changes and KPI updates.
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          const target = mutation.target;

          if (target.isConnected) {
            visit(target, lang);
          }
        }

        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.isConnected) {
              visit(node, lang);
            }
          });
        }
      }
    });

    observer.observe(root, {
      subtree: true,
      childList: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [lang]);

  return null;
}
'@

$updated = $page.Replace(
    $anchor,
    $anchor + "`r`n" +
    'import GlobalNumberLocalization from "../components/GlobalNumberLocalization";'
)

$updated = [regex]::Replace(
    $updated,
    $rootPattern,
    [System.Text.RegularExpressions.MatchEvaluator]{
        param($match)
        return $match.Value +
            "`r`n      {/* MCBP_GLOBAL_NUMBER_LOCALIZATION_V1 */}" +
            "`r`n      <GlobalNumberLocalization lang={lang} />"
    }
)

if (-not $updated.Contains($marker)) {
    throw "Patch validation failed. No changes made."
}

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backup = ".\project-audit\page.before-global-numbers-$stamp.tsx.txt"

Copy-Item $pagePath $backup -Force

[System.IO.File]::WriteAllText(
    $componentPath,
    $component,
    $utf8
)

[System.IO.File]::WriteAllText(
    $pagePath,
    $updated,
    $utf8
)

Write-Host ""
Write-Host "SUCCESS: Global number localization installed." -ForegroundColor Green
Write-Host "Backup: $backup"
Write-Host "Component: $componentPath"
Write-Host ""
Write-Host "English mode: English digits"
Write-Host "Bangla mode: Bangla display digits"

