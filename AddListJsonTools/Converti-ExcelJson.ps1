
# Percorso al file Excel
$excelPath = "valutazioni.xlsx"

# Avvia Excel (in background)
$excel = New-Object -ComObject Excel.Application
$workbook = $excel.Workbooks.Open((Resolve-Path $excelPath))

# Funzione per leggere un foglio e convertirlo in oggetti
function Get-SheetData($sheetName) {
    $sheet = $workbook.Sheets.Item($sheetName)
    $range = $sheet.UsedRange
    $rows = @()

    $headers = @()
    for ($col = 1; $col -le $range.Columns.Count; $col++) {
        $headers += $range.Cells.Item(1, $col).Text
    }

    for ($row = 2; $row -le $range.Rows.Count; $row++) {
        $obj = @{}
        for ($col = 1; $col -le $headers.Count; $col++) {
            $obj[$headers[$col - 1]] = $range.Cells.Item($row, $col).Text
        }
        $rows += [PSCustomObject]$obj
    }
    return $rows
}

# Film
$film = Get-SheetData "Film"

# Serie
$serie = Get-SheetData "Serie"

# Musica + Brani
$rawMusica = Get-SheetData "Musica"
$musica = @()

foreach ($albumGroup in $rawMusica | Group-Object id_album) {
    $first = $albumGroup.Group[0]
    $album = @{
        id = [int]$first.id_album
        titolo = $first.titolo_album
        voto = [int]$first.voto_album
        commento = $first.commento_album
        brani = @()
    }

    foreach ($track in $albumGroup.Group) {
        $album.brani += @{
            titolo = $track.titolo_brano
            voto = [int]$track.voto_brano
            durata = $track.durata_brano
        }
    }

    $musica += $album
}

# Costruisci il JSON
$output = @{
    film = $film
    serie = $serie
    musica = $musica
}

# Esporta
$output | ConvertTo-Json -Depth 5 | Out-File -Encoding UTF8 "valutazioni.json"

# Chiudi Excel
$workbook.Close($false)
$excel.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
