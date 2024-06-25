7-Zip
Ardour
Audacious
Audacity
Bitwig-Studio
Blender
Borg
Bottles
Calibre
Chromium
Darktable
DaVinci-Resolve
digiKam
Discord
Distrobox
Docker
Dolphin
Dropbox
Eagle-Mode
Elisa
Evolution
FFMPEG
Firefox
Foliate
FreeFileSync
Freeplane
GIMP
Git
Godot
Google-Earth
Geany
Boxes
GnuCash
Gwenview
HandBrake
Haruna
Heroic-Games-Launcher
HomeBank
Inkscape
Jellyfin-Client
Jellyfin-Server
Kate
Kdenlive
KeePassXC
Koodo-Reader
KOReader
Krita
kstars
LibreOffice
LibreWolf
LMMS
Lutris
MEGAsync
MyPaint
MPV
MuseScore
MusicBee
MusicBrainz-Picard
Neovim
Nmap
Node.js
OBS-Studio
Obsidian
Ocenaudio
Okular
OnlyOffice
OpenShot
PlayOnLinux
Proton
Proton-QT
PuTTY
Python
qBittorrent
QEMU
RawTherapee
Rclone
REAPER
Rsync
Shotcut
Shotwell
StabilityMatrix
Steam
Stellarium
Strawberry
Sublime-Text 4
Telegram
Tenacity
Thunderbird
tmux
Transmission
tree
Ungoogled-Chromium
Ventoy
VeraCrypt
virt-manager
VirtualBox
Visual-Studio-Code
VLC-Media-Player
VMware-Workstation
WayDroid
Wine
Wordpress
Xen
XnView-MP
YT-DLP
ytDownloader


---

- Go to packages-info.json and select all lines that contains `name` as regex mode.

```
Find: ^.*name.*$
```

- Then click alt enter to select the text and copy all lines.

- Then paste this lines and remove the non part of the name like:
`            "name": "` and `",`