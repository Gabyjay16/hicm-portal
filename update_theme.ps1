$files = Get-ChildItem -Path src\components -Recurse -Filter *.tsx
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $newContent = $content -replace 'bg-navy-900', 'bg-slate-50' `
                           -replace 'bg-navy-800', 'bg-white' `
                           -replace 'bg-slate-900', 'bg-slate-50' `
                           -replace 'bg-slate-800', 'bg-white' `
                           -replace 'bg-slate-700', 'bg-slate-100' `
                           -replace 'border-slate-700/[0-9]+', 'border-slate-200' `
                           -replace 'border-slate-700', 'border-slate-200' `
                           -replace 'border-slate-600', 'border-slate-300' `
                           -replace 'border-white/20', 'border-slate-200' `
                           -replace 'text-offwhite', 'text-slate-900' `
                           -replace 'text-slate-200', 'text-slate-800' `
                           -replace 'text-slate-300', 'text-slate-700' `
                           -replace 'text-slate-400', 'text-slate-600' `
                           -replace 'text-white block', 'text-slate-900 block' `
                           -replace 'text-white font-bold', 'text-slate-900 font-bold'
    if ($content -cne $newContent) {
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        Write-Output "Updated $($file.FullName)"
    }
}
