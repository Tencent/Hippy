#!/bin/bash

if ! git lfs help 1>/dev/null 2>&1 ; then
    echo ''
    echo "You should intall LFS first!"
    exit 1
fi

[ -n "$1" -a -d "$1" ] && cd "$1"

echo "当前目录：$(pwd)"
read -p '确认开启LFS？(Y/N)  ' opt
[[ "${opt}" =~ [Nn] ]] && exit 2

if [ $(git status --short | grep -v 'SubProject/' | wc -l) -gt 0 ]; then
    echo ''
    echo "There're uncommited local modifications:"
    git status --short
    echo "Please commit/stash/reset first."
    exit 3
fi

binary_ext="
*.so
*.zip
*.jsbundle
*.jar
*.dat
*.7z
*.xls
*.xlsx
*.doc
*.docx
*.ttf
*.symbol
*.rar
*.qbs
*.qar
*.mp3
*.mp4
*.gz
*.tar
*.apk
*.aar
*.exe
*.dll
*.arsc
*.bin
*.obj
*.wxapkg
*.hprof
*.trace
*.glsl
*.class
*.dex
"

for ext in ${binary_ext}
do
    git lfs track ${ext}
done

git add .gitattributes
git commit -m 'enable lfs'

echo -e "\n"
echo "LFS is enabled for $(pwd | sed -e 's#/$##' -e 's#.*/##'). Please manually commit following binary files:"
git status --short

exit 0
