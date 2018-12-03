function ZipFiles( $zipfilename, $sourcedir )
{
   Add-Type -Assembly System.IO.Compression.FileSystem
   $compressionLevel = [System.IO.Compression.CompressionLevel]::Optimal
   [System.IO.Compression.ZipFile]::CreateFromDirectory($sourcedir,
        $zipfilename, $compressionLevel, $false)
}

Remove-Item -Path "release.zip" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "tmp" -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path "tmp" -InformationAction SilentlyContinue
Copy-Item .\generate-impi-geo-database.exe .\tmp\generate-impi-geo-database.exe
Copy-Item .\node_modules\better-sqlite3 .\tmp\node_modules\better-sqlite3 -Recurse
Copy-Item .\node_modules\bindings .\tmp\node_modules\bindings -Recurse
Copy-Item .\node_modules\integer .\tmp\node_modules\integer -Recurse

ZipFiles "release.zip" .\tmp