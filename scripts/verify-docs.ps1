[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$strictUtf8 = [System.Text.UTF8Encoding]::new($false, $true)
$failures = [System.Collections.Generic.List[string]]::new()
$pathComparison = if ($IsWindows) {
    [System.StringComparison]::OrdinalIgnoreCase
}
else {
    [System.StringComparison]::Ordinal
}

function ConvertTo-RepositoryPath {
    param([Parameter(Mandatory)][string]$Path)

    return $Path.Replace('\', '/')
}

$requiredDocuments = @(
    'README.md',
    'DECISIONS.md',
    '01-product-foundation.md',
    '02-phase-one-product.md',
    '03-user-experience-and-ia.md',
    '04-two-sided-market.md',
    '05-chida-behavior-and-trust.md',
    '06-roadmap-and-horizons.md',
    '07-business-launch-and-metrics.md'
)

$repositoryFilePaths = @(
    & git -C $repoRoot -c core.quotepath=false ls-files --cached --others --exclude-standard
)
if ($LASTEXITCODE -ne 0) {
    throw 'Unable to enumerate tracked and non-ignored repository files with Git.'
}

$repositoryFiles = @(
    $repositoryFilePaths |
        Where-Object { -not [string]::IsNullOrWhiteSpace($_) } |
        ForEach-Object { Get-Item -LiteralPath (Join-Path $repoRoot $_) }
)
$markdownFiles = @(
    $repositoryFiles | Where-Object { $_.Extension -eq '.md' }
)

$scannableExtensions = [System.Collections.Generic.HashSet[string]]::new(
    [string[]]@('.md', '.ps1', '.yml', '.yaml', '.json', '.toml', '.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.py', '.go', '.rs', '.java', '.kt', '.cs'),
    [System.StringComparer]::OrdinalIgnoreCase
)
$secretPatterns = @(
    [regex]'\bgh[pousr]_[A-Za-z0-9_]{20,}\b',
    [regex]'\bgithub_pat_[A-Za-z0-9_]{20,}\b',
    [regex]'\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b',
    [regex]'\b(?:AKIA|ASIA)[0-9A-Z]{16}\b',
    [regex]'\bAIza[0-9A-Za-z_-]{35}\b',
    [regex]'\bsk_live_[0-9A-Za-z]{16,}\b',
    [regex]'\bxox[baprs]-[0-9A-Za-z-]{20,}\b',
    [regex]'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----'
)

$repositoryPaths = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::Ordinal)
$repositoryFilePaths | ForEach-Object {
    $relativePath = ConvertTo-RepositoryPath $_
    [void]$repositoryPaths.Add($relativePath)

    $parent = $relativePath
    while ($parent.Contains('/')) {
        $parent = $parent.Substring(0, $parent.LastIndexOf('/'))
        [void]$repositoryPaths.Add($parent)
    }
}

foreach ($relativePath in $requiredDocuments) {
    if (-not $repositoryPaths.Contains($relativePath)) {
        $failures.Add("Missing or incorrectly cased required product document: $relativePath")
    }
}

$contentByPath = @{}
foreach ($file in $markdownFiles) {
    try {
        $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
        $text = $strictUtf8.GetString($bytes)
        $contentByPath[$file.FullName] = $text

        $relativePath = [System.IO.Path]::GetRelativePath($repoRoot, $file.FullName)
        if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
            $failures.Add("UTF-8 BOM is not allowed: $relativePath")
        }
        if (
            ($bytes.Length -ge 2 -and $bytes[0] -eq 0xFF -and $bytes[1] -eq 0xFE) -or
            ($bytes.Length -ge 2 -and $bytes[0] -eq 0xFE -and $bytes[1] -eq 0xFF) -or
            ($bytes.Length -ge 4 -and $bytes[0] -eq 0x00 -and $bytes[1] -eq 0x00 -and $bytes[2] -eq 0xFE -and $bytes[3] -eq 0xFF) -or
            ($bytes.Length -ge 4 -and $bytes[0] -eq 0xFF -and $bytes[1] -eq 0xFE -and $bytes[2] -eq 0x00 -and $bytes[3] -eq 0x00)
        ) {
            $failures.Add("UTF-16 or UTF-32 BOM is not allowed: $relativePath")
        }
        if ($text.Contains([char]0)) {
            $failures.Add("NUL character found: $relativePath")
        }
        if ($text.Contains([char]0xFFFD)) {
            $failures.Add("Unicode replacement character found: $relativePath")
        }
        if (-not $text.IsNormalized([System.Text.NormalizationForm]::FormC)) {
            $failures.Add("Text is not Unicode NFC normalized: $relativePath")
        }
        if ($text.Contains("`r")) {
            $failures.Add("Line endings must be LF: $relativePath")
        }
        if (-not $text.EndsWith("`n")) {
            $failures.Add("File must end with a newline: $relativePath")
        }
        if ($text -match '(?:Ø§|Ù…|ÛŒ|â€Œ)') {
            $failures.Add("Common Persian mojibake sequence found: $relativePath")
        }
    }
    catch {
        $relativePath = [System.IO.Path]::GetRelativePath($repoRoot, $file.FullName)
        $failures.Add("File is not valid UTF-8: $relativePath")
    }
}

$scannableFiles = @(
    $repositoryFiles |
        Where-Object {
            $scannableExtensions.Contains($_.Extension) -and
            $_.Length -le 2MB
        }
)

foreach ($file in $scannableFiles) {
    try {
        $text = $strictUtf8.GetString([System.IO.File]::ReadAllBytes($file.FullName))
        foreach ($pattern in $secretPatterns) {
            if ($pattern.IsMatch($text)) {
                $relativePath = [System.IO.Path]::GetRelativePath($repoRoot, $file.FullName)
                $failures.Add("High-signal secret pattern found: $relativePath")
                break
            }
        }
    }
    catch {
        $relativePath = [System.IO.Path]::GetRelativePath($repoRoot, $file.FullName)
        $failures.Add("Scannable text file is not valid UTF-8: $relativePath")
    }
}

$linkPattern = [regex]'\[[^\]]+\]\((?<target>[^)]+)\)'
foreach ($file in $markdownFiles) {
    if (-not $contentByPath.ContainsKey($file.FullName)) {
        continue
    }

    $checkableMarkdown = [regex]::Replace(
        $contentByPath[$file.FullName],
        '(?ms)^\s*```.*?^\s*```\s*$',
        ''
    )
    if ($checkableMarkdown -match '(?m)^\s*\[[^\]]+\]:\s*\S+') {
        $relativeFile = [System.IO.Path]::GetRelativePath($repoRoot, $file.FullName)
        $failures.Add("Reference-style Markdown links are not supported by this verifier: $relativeFile")
    }

    foreach ($match in $linkPattern.Matches($checkableMarkdown)) {
        $target = $match.Groups['target'].Value.Trim()
        if ($target -match '^(?:https?:|mailto:|tel:|data:|#)') {
            continue
        }

        if ($target -match '^<(?<path>[^>]+)>(?:\s+(?:"[^"]*"|''[^'']*''|\([^)]*\)))?$') {
            $target = $Matches['path']
        }
        elseif ($target -match '^(?<path>\S+)(?:\s+(?:"[^"]*"|''[^'']*''|\([^)]*\)))?$') {
            $target = $Matches['path']
        }
        else {
            $relativeFile = [System.IO.Path]::GetRelativePath($repoRoot, $file.FullName)
            $failures.Add("Unsupported or ambiguous inline Markdown link in $relativeFile`: $target")
            continue
        }

        $pathOnly = ($target -split '[?#]', 2)[0]
        if ([string]::IsNullOrWhiteSpace($pathOnly)) {
            continue
        }

        if ([System.IO.Path]::IsPathRooted($pathOnly)) {
            $relativeFile = [System.IO.Path]::GetRelativePath($repoRoot, $file.FullName)
            $failures.Add("Absolute local link is not allowed in $relativeFile`: $target")
            continue
        }

        try {
            $decodedPath = [System.Uri]::UnescapeDataString($pathOnly)
            $resolvedPath = [System.IO.Path]::GetFullPath((Join-Path $file.DirectoryName $decodedPath))
        }
        catch {
            $relativeFile = [System.IO.Path]::GetRelativePath($repoRoot, $file.FullName)
            $failures.Add("Invalid local link in $relativeFile`: $target")
            continue
        }

        $repoPrefix = $repoRoot + [System.IO.Path]::DirectorySeparatorChar
        if (-not $resolvedPath.StartsWith($repoPrefix, $pathComparison)) {
            $relativeFile = [System.IO.Path]::GetRelativePath($repoRoot, $file.FullName)
            $failures.Add("Local link escapes the repository in $relativeFile`: $target")
            continue
        }

        $resolvedRelativePath = ConvertTo-RepositoryPath ([System.IO.Path]::GetRelativePath($repoRoot, $resolvedPath))
        if (-not $repositoryPaths.Contains($resolvedRelativePath)) {
            $relativeFile = [System.IO.Path]::GetRelativePath($repoRoot, $file.FullName)
            $failures.Add("Broken or incorrectly cased local link in $relativeFile`: $target")
        }
    }
}

$canonicalFiles = @(
    $requiredDocuments | ForEach-Object { Join-Path $repoRoot $_ }
)

foreach ($path in $canonicalFiles) {
    if (-not $contentByPath.ContainsKey($path)) {
        continue
    }

    if ($contentByPath[$path] -match '(?i)\b(?:TODO|TBD|FIXME|PLACEHOLDER)\b|LOREM\s+IPSUM|\?\?\?|\{\{[^}]+\}\}') {
        $relativePath = [System.IO.Path]::GetRelativePath($repoRoot, $path)
        $failures.Add("Unresolved placeholder found in canonical document: $relativePath")
    }
}

$ledgerPath = Join-Path $repoRoot 'DECISIONS.md'
$definitionPattern = [regex]'(?m)^\|\s*(?<id>[دپبف]-[۰-۹]{3})\s*\|'
$referencePattern = [regex]'(?<![\p{L}\p{Nd}])[دپبف]-[۰-۹]{3}(?![\p{L}\p{Nd}])'
$potentialIdPattern = [regex]'(?<![\p{L}\p{Nd}])(?<candidate>[دپبف][-‐-―−][\p{L}\p{Nd}]{1,8})'
$validIdPattern = [regex]'^[دپبف]-[۰-۹]{3}$'
$definedIds = [System.Collections.Generic.List[string]]::new()

if ($contentByPath.ContainsKey($ledgerPath)) {
    foreach ($match in $definitionPattern.Matches($contentByPath[$ledgerPath])) {
        $definedIds.Add($match.Groups['id'].Value)
    }
}

$duplicateDefinitions = @(
    $definedIds | Group-Object | Where-Object { $_.Count -gt 1 }
)
foreach ($duplicate in $duplicateDefinitions) {
    $failures.Add("Duplicate decision-ledger definition: $($duplicate.Name)")
}

$definedSet = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::Ordinal)
foreach ($id in $definedIds) {
    [void]$definedSet.Add($id)
}

$referencedSet = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::Ordinal)
$externalReferencedSet = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::Ordinal)
foreach ($path in $contentByPath.Keys) {
    $checkableMarkdown = [regex]::Replace($contentByPath[$path], '(?ms)^\s*```.*?^\s*```\s*$', '')
    foreach ($potentialMatch in $potentialIdPattern.Matches($checkableMarkdown)) {
        $candidate = $potentialMatch.Groups['candidate'].Value
        if (-not $validIdPattern.IsMatch($candidate)) {
            $relativePath = [System.IO.Path]::GetRelativePath($repoRoot, $path)
            $failures.Add("Malformed or visually confusable decision ID in $relativePath`: $candidate")
        }
    }

    foreach ($match in $referencePattern.Matches($checkableMarkdown)) {
        [void]$referencedSet.Add($match.Value)
        if ($path -ne $ledgerPath) {
            [void]$externalReferencedSet.Add($match.Value)
        }
    }
}

foreach ($id in $referencedSet) {
    if (-not $definedSet.Contains($id)) {
        $failures.Add("Undefined decision-ledger reference: $id")
    }
}

if ($failures.Count -gt 0) {
    [Console]::Error.WriteLine('Documentation verification failed:')
    foreach ($failure in $failures) {
        [Console]::Error.WriteLine("- $failure")
    }
    exit 1
}

$kindCounts = $definedIds |
    Group-Object { ($_ -split '-', 2)[0] } |
    Sort-Object Name |
    ForEach-Object { "$($_.Name)=$($_.Count)" }

Write-Output 'DOCUMENTATION_OK'
Write-Output "markdown_files=$($markdownFiles.Count)"
Write-Output "required_product_documents=$($requiredDocuments.Count)"
Write-Output "decision_ledger_ids=$($definedSet.Count)"
Write-Output "all_seen_ids=$($referencedSet.Count)"
Write-Output "externally_referenced_ids=$($externalReferencedSet.Count)"
Write-Output "id_kinds=$($kindCounts -join ',')"
