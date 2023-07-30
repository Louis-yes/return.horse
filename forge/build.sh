cp clay/index.template.html index.html
a=clay/comics.tsv
sed -i .bak "/<data id=\"comics\">/ r $a" index.html
