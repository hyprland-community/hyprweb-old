# shellcheck shell=bash
set -euo pipefail

files=(
	"projects -> Hyprland Community Project List"
	"themes -> Hyprtheme theme browser"
	"index -> Hyprland community homepage"
)

build_dir="$PWD/dist"
source_dir="$PWD/src"

mkdir -p $build_dir
touch "${build_dir}"/.nojekyll
cp "${source_dir}"/*.js "${build_dir}"

# fonts
mkdir -p "${build_dir}"/fonts
cp "${source_dir}"/fonts/*.* "${build_dir}"/fonts

# assets,
mkdir -p "${build_dir}"/assets
cp "${source_dir}"/assets/*.* "${build_dir}"/assets
for i in "${files[@]}"; do
	file=$(echo "$i" | sed -E 's/ -> .*//')
	title=$(echo "$i" | sed -E 's/.* -> //')
	mkdir "$build_dir" -p
	if [[ $file != "index" ]]; then
		mkdir -p "${build_dir}"/"${file}"
		touch "${build_dir}"/"${file}"/index.html
		rm "${build_dir}"/"${file}"/index.html
		gen=$(./builder/templater.sh "$title" "${source_dir}/${file}.html" "${source_dir}/global.css")
		echo $gen > "${build_dir}"/"${file}"/index.html
		echo $gen > "${build_dir}"/"${file}".html
	else
		touch "${build_dir}"/index.html
		rm "${build_dir}"/index.html
		./builder/templater.sh "$title" "${source_dir}/index.html" "${source_dir}/global.css" > "${build_dir}"/index.html
	fi
done
