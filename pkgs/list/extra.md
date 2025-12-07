# Extra

- List pkgs

```sh
$packagesInfo = Get-Content "d:\Workspaces\David7ce-repos\code\toolbox-installer\pkgs\packages-info.json" | ConvertFrom-Json; $namesList = @(); foreach ($key in $packagesInfo.packages.PSObject.Properties.Name) { $name = $packagesInfo.packages.$key.name; if ($name) { $namesList += $name } }; $output = @{ packages = $namesList } | ConvertTo-Json -Depth 10; $output | Out-File "d:\Workspaces\David7ce-repos\code\toolbox-installer\pkgs\list\list-packages.json" -Encoding UTF8; Write-Host "Created list-packages.json with $($namesList.Count) package names"
```
