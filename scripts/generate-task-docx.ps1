param(
  [string]$Source = (Join-Path $PSScriptRoot '..\TASKURI_RESTRUCTURARE_WEB.md'),
  [string]$Output = (Join-Path $PSScriptRoot '..\TASKURI_RESTRUCTURARE_WEB.docx')
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression

function Escape-Xml([string]$Value) {
  return [System.Security.SecurityElement]::Escape($Value)
}

function New-Run([string]$Text, [bool]$Bold = $false, [bool]$Code = $false) {
  $properties = ''
  if ($Bold -or $Code) {
    $parts = @()
    if ($Bold) { $parts += '<w:b/>' }
    if ($Code) { $parts += '<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:color w:val="315F65"/><w:shd w:fill="EAF2F1"/>' }
    $properties = '<w:rPr>' + ($parts -join '') + '</w:rPr>'
  }
  return '<w:r>' + $properties + '<w:t xml:space="preserve">' + (Escape-Xml $Text) + '</w:t></w:r>'
}

function Convert-Inline([string]$Text) {
  $runs = New-Object System.Collections.Generic.List[string]
  $pattern = '(\*\*[^*]+\*\*|`[^`]+`)'
  $cursor = 0
  foreach ($match in [regex]::Matches($Text, $pattern)) {
    if ($match.Index -gt $cursor) {
      $runs.Add((New-Run $Text.Substring($cursor, $match.Index - $cursor)))
    }
    $token = $match.Value
    if ($token.StartsWith('**')) {
      $runs.Add((New-Run $token.Substring(2, $token.Length - 4) $true $false))
    } else {
      $runs.Add((New-Run $token.Substring(1, $token.Length - 2) $false $true))
    }
    $cursor = $match.Index + $match.Length
  }
  if ($cursor -lt $Text.Length) {
    $runs.Add((New-Run $Text.Substring($cursor)))
  }
  if ($runs.Count -eq 0) { $runs.Add((New-Run $Text)) }
  return $runs -join ''
}

function New-Paragraph([string]$Text, [string]$Style = 'Normal', [string]$Prefix = '') {
  $spacing = switch ($Style) {
    'Title' { '<w:spacing w:before="0" w:after="260"/>' }
    'Heading1' { '<w:spacing w:before="360" w:after="140"/>' }
    'Heading2' { '<w:spacing w:before="260" w:after="100"/>' }
    'Heading3' { '<w:spacing w:before="180" w:after="80"/>' }
    default { '<w:spacing w:after="110" w:line="300" w:lineRule="auto"/>' }
  }
  $indent = if ($Style -in @('ListBullet', 'ListNumber')) { '<w:ind w:left="520" w:hanging="260"/>' } else { '' }
  $keep = if ($Style -like 'Heading*') { '<w:keepNext/>' } else { '' }
  $prefixRun = if ($Prefix) { New-Run $Prefix $true $false } else { '' }
  return '<w:p><w:pPr><w:pStyle w:val="' + $Style + '"/>' + $spacing + $indent + $keep + '</w:pPr>' + $prefixRun + (Convert-Inline $Text) + '</w:p>'
}

$paragraphs = New-Object System.Collections.Generic.List[string]
$listIndex = 0

foreach ($rawLine in Get-Content -LiteralPath $Source -Encoding UTF8) {
  $line = $rawLine.TrimEnd()
  if ([string]::IsNullOrWhiteSpace($line)) { continue }

  if ($line -match '^# (.+)$') {
    $paragraphs.Add((New-Paragraph $Matches[1] 'Title'))
    $paragraphs.Add((New-Paragraph 'Plan de lucru pentru îmbunătățirea experienței web' 'Subtitle'))
    continue
  }
  if ($line -match '^## (.+)$') {
    $paragraphs.Add((New-Paragraph $Matches[1] 'Heading1'))
    continue
  }
  if ($line -match '^### (.+)$') {
    $paragraphs.Add((New-Paragraph $Matches[1] 'Heading2'))
    continue
  }
  if ($line -match '^- (.+)$') {
    $paragraphs.Add((New-Paragraph $Matches[1] 'ListBullet' '•  '))
    continue
  }
  if ($line -match '^(\d+)\. (.+)$') {
    $paragraphs.Add((New-Paragraph $Matches[2] 'ListNumber' ($Matches[1] + '.  ')))
    continue
  }
  $paragraphs.Add((New-Paragraph $line 'Normal'))
}

$documentXml = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
'@ + ($paragraphs -join "`n") + @'
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1134" w:right="1190" w:bottom="1134" w:left="1190" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>
'@

$stylesXml = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/><w:sz w:val="22"/><w:color w:val="263238"/><w:lang w:val="ro-RO"/></w:rPr></w:rPrDefault>
    <w:pPrDefault><w:pPr><w:spacing w:after="110"/></w:pPr></w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>
  <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:qFormat/><w:rPr><w:rFonts w:ascii="Aptos Display" w:hAnsi="Aptos Display"/><w:b/><w:color w:val="173F43"/><w:sz w:val="40"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:rPr><w:color w:val="5F7476"/><w:sz w:val="23"/><w:i/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:rPr><w:rFonts w:ascii="Aptos Display" w:hAnsi="Aptos Display"/><w:b/><w:color w:val="173F43"/><w:sz w:val="30"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:rPr><w:b/><w:color w:val="28747A"/><w:sz w:val="25"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:rPr><w:b/><w:color w:val="315F65"/><w:sz w:val="23"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="ListBullet"><w:name w:val="List Bullet"/><w:basedOn w:val="Normal"/></w:style>
  <w:style w:type="paragraph" w:styleId="ListNumber"><w:name w:val="List Number"/><w:basedOn w:val="Normal"/></w:style>
</w:styles>
'@

$contentTypes = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>
'@

$relationships = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>
'@

$documentRelationships = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>
'@

$tempRoot = [System.IO.Path]::GetTempPath()
$tempPath = Join-Path $tempRoot ('norvegiata-docx-' + [guid]::NewGuid().ToString('N'))
$resolvedOutput = [System.IO.Path]::GetFullPath($Output)

try {
  New-Item -ItemType Directory -Path (Join-Path $tempPath '_rels') -Force | Out-Null
  New-Item -ItemType Directory -Path (Join-Path $tempPath 'word\_rels') -Force | Out-Null
  [System.IO.File]::WriteAllText((Join-Path $tempPath '[Content_Types].xml'), $contentTypes, [System.Text.UTF8Encoding]::new($false))
  [System.IO.File]::WriteAllText((Join-Path $tempPath '_rels\.rels'), $relationships, [System.Text.UTF8Encoding]::new($false))
  [System.IO.File]::WriteAllText((Join-Path $tempPath 'word\document.xml'), $documentXml, [System.Text.UTF8Encoding]::new($false))
  [System.IO.File]::WriteAllText((Join-Path $tempPath 'word\styles.xml'), $stylesXml, [System.Text.UTF8Encoding]::new($false))
  [System.IO.File]::WriteAllText((Join-Path $tempPath 'word\_rels\document.xml.rels'), $documentRelationships, [System.Text.UTF8Encoding]::new($false))

  if (Test-Path -LiteralPath $resolvedOutput) { Remove-Item -LiteralPath $resolvedOutput -Force }
  $outputStream = [System.IO.File]::Open($resolvedOutput, [System.IO.FileMode]::CreateNew)
  try {
    $archive = New-Object System.IO.Compression.ZipArchive($outputStream, [System.IO.Compression.ZipArchiveMode]::Create, $false)
    try {
      $packageFiles = [ordered]@{
        '[Content_Types].xml' = (Join-Path $tempPath '[Content_Types].xml')
        '_rels/.rels' = (Join-Path $tempPath '_rels\.rels')
        'word/document.xml' = (Join-Path $tempPath 'word\document.xml')
        'word/styles.xml' = (Join-Path $tempPath 'word\styles.xml')
        'word/_rels/document.xml.rels' = (Join-Path $tempPath 'word\_rels\document.xml.rels')
      }
      foreach ($packageFile in $packageFiles.GetEnumerator()) {
        $entry = $archive.CreateEntry($packageFile.Key, [System.IO.Compression.CompressionLevel]::Optimal)
        $entryStream = $entry.Open()
        $sourceStream = [System.IO.File]::OpenRead($packageFile.Value)
        try { $sourceStream.CopyTo($entryStream) } finally {
          $sourceStream.Dispose()
          $entryStream.Dispose()
        }
      }
    } finally {
      $archive.Dispose()
    }
  } finally {
    $outputStream.Dispose()
  }
} finally {
  $resolvedTempPath = [System.IO.Path]::GetFullPath($tempPath)
  if ($resolvedTempPath.StartsWith([System.IO.Path]::GetFullPath($tempRoot)) -and (Test-Path -LiteralPath $resolvedTempPath)) {
    Remove-Item -LiteralPath $resolvedTempPath -Recurse -Force
  }
}

Write-Output $resolvedOutput
