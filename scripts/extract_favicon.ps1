Add-Type -AssemblyName System.Drawing

$logoPath = Resolve-Path "public/brand/logo.png"
$fullImg = [System.Drawing.Bitmap]::FromFile($logoPath)

$w = $fullImg.Width
$h = $fullImg.Height
Write-Host "Full Logo Image: $w x $h"

# The logo is composed of:
# "MADE" on top, "MAKE SOMETHING REAL." on bottom.
# "M", "A", "D", "E" across the width.
# Let's find the bounding box of the letters and specifically the 'A' character.

# Background color is approximately #F5F3EC (top left pixel)
$bg = $fullImg.GetPixel(5, 5)
Write-Host "Background color: R=$($bg.R), G=$($bg.G), B=$($bg.B)"

# Scan for dark pixels (text) in the image
$minX = $w; $maxX = 0; $minY = $h; $maxY = 0
for ($y = 0; $y -lt [Math]::Floor($h * 0.7); $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $pixel = $fullImg.GetPixel($x, $y)
        # Check if significantly darker than background
        if ($pixel.R -lt 100 -and $pixel.G -lt 100 -and $pixel.B -lt 100) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Host "Top MADE Text bounds: X=[$minX, $maxX], Y=[$minY, $maxY]"
$madeWidth = $maxX - $minX
$letterWidth = $madeWidth / 4.0

# 'A' is the second letter in MADE
# Let's find exact column bounds for 'A'
# Looking between minX + 0.2*madeWidth to minX + 0.55*madeWidth
$aMinX = $w; $aMaxX = 0; $aMinY = $h; $aMaxY = 0
for ($y = $minY; $y -le $maxY; $y++) {
    for ($x = [int]($minX + $letterWidth * 0.85); $x -le [int]($minX + $letterWidth * 2.2); $x++) {
        $pixel = $fullImg.GetPixel($x, $y)
        if ($pixel.R -lt 100 -and $pixel.G -lt 100 -and $pixel.B -lt 100) {
            if ($x -lt $aMinX) { $aMinX = $x }
            if ($x -gt $aMaxX) { $aMaxX = $x }
            if ($y -lt $aMinY) { $aMinY = $y }
            if ($y -gt $aMaxY) { $aMaxY = $y }
        }
    }
}

Write-Host "Exact 'A' character bounds: X=[$aMinX, $aMaxX], Y=[$aMinY, $aMaxY]"

# Add balanced padding
$aW = $aMaxX - $aMinX + 1
$aH = $aMaxY - $aMinY + 1
$maxDim = [Math]::Max($aW, $aH)
$pad = [int]($maxDim * 0.15)
$cropSize = $maxDim + ($pad * 2)

$centerX = [int](($aMinX + $aMaxX) / 2)
$centerY = [int](($aMinY + $aMaxY) / 2)

$cropX = [Math]::Max(0, [int]($centerX - $cropSize / 2))
$cropY = [Math]::Max(0, [int]($centerY - $cropSize / 2))

Write-Host "Crop Box: X=$cropX, Y=$cropY, Size=$cropSize"

# 1. Create Transparent Crop of the exact original 'A' character
$targetBmp = New-Object System.Drawing.Bitmap $cropSize, $cropSize
$g = [System.Drawing.Graphics]::FromImage($targetBmp)
$g.Clear([System.Drawing.Color]::Transparent)

for ($py = 0; $py -lt $cropSize; $py++) {
    for ($px = 0; $px -lt $cropSize; $px++) {
        $srcX = $cropX + $px
        $srcY = $cropY + $py
        if ($srcX -ge 0 -and $srcX -lt $w -and $srcY -ge 0 -and $srcY -lt $h) {
            $p = $fullImg.GetPixel($srcX, $srcY)
            # If pixel is near background color, keep transparent.
            # If dark, preserve exact pixel color with clean alpha blending.
            $distFromBg = [Math]::Abs($p.R - $bg.R) + [Math]::Abs($p.G - $bg.G) + [Math]::Abs($p.B - $bg.B)
            if ($distFromBg -gt 40) {
                $targetBmp.SetPixel($px, $py, $p)
            }
        }
    }
}

# Save standalone mark assets
$targetBmp.Save("public/brand/a-mark.png", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Saved public/brand/a-mark.png"

# 2. Also create dark background variant for favicon (high contrast #0C0C0E background with light off-white 'A')
$faviconBmp = New-Object System.Drawing.Bitmap 64, 64
$fg = [System.Drawing.Graphics]::FromImage($faviconBmp)
$fg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$fg.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$fg.Clear([System.Drawing.Color]::FromArgb(255, 12, 12, 14)) # #0C0C0E

# Draw inverted / light 'A' onto dark background
$lightABmp = New-Object System.Drawing.Bitmap $cropSize, $cropSize
for ($py = 0; $py -lt $cropSize; $py++) {
    for ($px = 0; $px -lt $cropSize; $px++) {
        $p = $targetBmp.GetPixel($px, $py)
        if ($p.A -gt 30) {
            # Render ivory / off-white #F4F4F7 matching text-primary
            $alpha = $p.A
            $lightABmp.SetPixel($px, $py, [System.Drawing.Color]::FromArgb($alpha, 244, 244, 247))
        }
    }
}

$fg.DrawImage($lightABmp, 6, 6, 52, 52)
$faviconBmp.Save("public/favicon.png", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Saved public/favicon.png"

$fullImg.Dispose()
$targetBmp.Dispose()
$faviconBmp.Dispose()
$lightABmp.Dispose()
$g.Dispose()
$fg.Dispose()
