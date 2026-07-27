$files = Get-ChildItem -Path src\components,src\layouts -Recurse -Filter *.tsx
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $newContent = $content -replace 'text-slate-300', 'text-black' `
                           -replace 'text-slate-400', 'text-slate-900' `
                           -replace 'text-slate-500', 'text-black' `
                           -replace 'text-slate-600', 'text-slate-900' `
                           -replace 'text-slate-700', 'text-black' `
                           -replace 'text-slate-800', 'text-black' `
                           -replace 'text-offwhite', 'text-black' `
                           -replace 'placeholder-slate-400', 'placeholder-slate-600'
    if ($content -cne $newContent) {
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        Write-Output "Updated $($file.FullName)"
    }
}
