param(
    [string]$InputCsv = "docs/video-curation.csv",
    [string]$OutputCsv = "docs/link-health-report.csv",
    [string]$OutputHtml = "docs/link-health-report.html"
)

$ErrorActionPreference = "Stop"

function Get-VideoStatus {
    param([string]$Url)

    if ([string]::IsNullOrWhiteSpace($Url) -or $Url -eq "to_validate") {
        return [pscustomobject]@{ Status = "to_validate"; Reason = "Missing or pending URL" }
    }

    try {
        $response = Invoke-WebRequest -Uri $Url -Method Head -MaximumRedirection 5 -TimeoutSec 15 -UseBasicParsing
        if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400) {
            return [pscustomobject]@{ Status = "ok"; Reason = "HTTP $($response.StatusCode)" }
        }
        return [pscustomobject]@{ Status = "suspect"; Reason = "HTTP $($response.StatusCode)" }
    }
    catch {
        try {
            $response = Invoke-WebRequest -Uri $Url -Method Get -MaximumRedirection 5 -TimeoutSec 20 -UseBasicParsing
            $text = [string]$response.Content
            if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400 -and $text -notmatch "Video unavailable|This video isn't available|Private video") {
                return [pscustomobject]@{ Status = "ok"; Reason = "GET HTTP $($response.StatusCode)" }
            }
            if ($text -match "Video unavailable|This video isn't available|Private video") {
                return [pscustomobject]@{ Status = "broken"; Reason = "YouTube unavailable/private marker found" }
            }
            return [pscustomobject]@{ Status = "suspect"; Reason = "GET HTTP $($response.StatusCode), content should be reviewed" }
        }
        catch {
            $message = $_.Exception.Message
            if ($message -match "404|410|unavailable|not found") {
                return [pscustomobject]@{ Status = "broken"; Reason = $message }
            }
            return [pscustomobject]@{ Status = "suspect"; Reason = $message }
        }
    }
}

if (-not (Test-Path -LiteralPath $InputCsv)) {
    throw "Input CSV not found: $InputCsv"
}

$rows = Import-Csv -LiteralPath $InputCsv
$checkedAt = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$results = foreach ($row in $rows) {
    $health = Get-VideoStatus -Url $row.youtube_url
    $metadataStatus = if ($row.channel -eq "to_validate" -or $row.views -eq "to_validate" -or $row.likes -eq "to_validate" -or $row.duration -eq "to_validate" -or $row.published_year -eq "to_validate" -or $row.start_timestamp -eq "to_validate") { "to_validate" } else { "ok" }

    [pscustomobject]@{
        checked_at = $checkedAt
        status = $health.Status
        metadata_status = $metadataStatus
        reason = $health.Reason
        step = $row.step
        topic = $row.topic
        language = $row.language
        is_primary = $row.is_primary
        video_title = $row.video_title
        channel = $row.channel
        youtube_url = $row.youtube_url
    }
}

$results | Export-Csv -LiteralPath $OutputCsv -NoTypeInformation -Encoding UTF8

$summary = $results | Group-Object status | Sort-Object Name | ForEach-Object {
    "<span class='summary-item summary-$($_.Name)'>$($_.Name): $($_.Count)</span>"
} | Out-String
$metadataSummary = ($results | Where-Object { $_.metadata_status -eq "to_validate" }).Count

$rowsHtml = $results | Sort-Object @{ Expression = { if ($_.is_primary -eq "true") { 0 } else { 1 } } }, status, {[int]$_.step}, language | ForEach-Object {
    $search = "https://www.youtube.com/results?search_query=" + [uri]::EscapeDataString("Power BI $($_.topic) $($_.language) beginner")
    "<tr class='$($_.status) metadata-$($_.metadata_status)'><td>$($_.status)</td><td>$($_.metadata_status)</td><td>$($_.step)</td><td>$($_.language)</td><td>$($_.is_primary)</td><td>$([System.Net.WebUtility]::HtmlEncode($_.video_title))</td><td>$([System.Net.WebUtility]::HtmlEncode($_.channel))</td><td><a href='$($_.youtube_url)'>video</a></td><td><a href='$search'>search</a></td><td>$([System.Net.WebUtility]::HtmlEncode($_.reason))</td></tr>"
} | Out-String

$html = @"
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Video Link Health Report</title>
  <style>
    body { font-family: "Segoe UI", Arial, sans-serif; margin: 24px; color: #172033; background: #f7f8fb; }
    h1 { margin-bottom: 4px; }
    .summary { display: flex; flex-wrap: wrap; gap: 8px; margin: 18px 0; }
    .summary-item { border-radius: 999px; padding: 6px 10px; border: 1px solid #d9e1ec; background: white; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; background: white; border: 1px solid #d9e1ec; }
    th, td { text-align: left; padding: 9px; border-bottom: 1px solid #d9e1ec; vertical-align: top; font-size: 14px; }
    th { background: #eef3f8; }
    tr.broken td:first-child { color: #991b1b; font-weight: 800; }
    tr.suspect td:first-child { color: #8a5a00; font-weight: 800; }
    tr.to_validate td:first-child { color: #0b5d57; font-weight: 800; }
    tr.ok td:first-child { color: #166534; font-weight: 800; }
    a { color: #0b5d57; font-weight: 700; }
  </style>
</head>
<body>
  <h1>Video Link Health Report</h1>
  <p>Checked at $checkedAt. Review <strong>broken</strong> and <strong>suspect</strong> link rows first. Metadata pending rows show <strong>to_validate</strong> in the metadata column.</p>
  <div class="summary">$summary</div>
  <p><strong>Metadata rows to validate:</strong> $metadataSummary</p>
  <table>
    <thead>
      <tr><th>Link status</th><th>Metadata</th><th>Step</th><th>Lang</th><th>Primary</th><th>Title</th><th>Channel</th><th>URL</th><th>Find replacement</th><th>Reason</th></tr>
    </thead>
    <tbody>
      $rowsHtml
    </tbody>
  </table>
</body>
</html>
"@

Set-Content -LiteralPath $OutputHtml -Value $html -Encoding UTF8

Write-Host "Created $OutputCsv"
Write-Host "Created $OutputHtml"
