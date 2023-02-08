# shellcheck shell=bash

set -euo pipefail

deps=(
	@lit-labs/scoped-registry-mixin
	@lit-labs/task
	@lit-labs/virtualizer
	@ltd/j-toml
	@material/mwc-icon/mwc-icon.js
	@webcomponents/custom-elements
	@webcomponents/scoped-custom-element-registry
	git-submodule-js
	lit
	lit/directives/map.js
	roughjs@4.4.5
	octokit
	wired-elements
	urlpattern-polyfill
	hyprparse-js/hyprparse_js.js
)

json2() {
	local json_path=$HOME/.cache/hyprcw/json.sh
	local args="${*:3}"
	mkdir -p "$HOME"/.cache/hyprcw
	if [[ ! -f $json_path ]]; then
		curl -s https://raw.githubusercontent.com/yavko/JSONPath.sh/master/JSONPath.sh > "$json_path"
		chmod a+x "$json_path"
	fi
	touch /tmp/hypr-templ.json
	rm /tmp/hypr-templ.json
	printf '%s' "$2" > /tmp/hypr-templ.json
	# shellcheck disable=SC2086
	$json_path -f /tmp/hypr-templ.json "$1" $args
}

serialize() {
	local buf="["
	for i in "${deps[@]}"; do
		buf+="\"${i}\","
	done
	printf '%s' "$(printf '%s' "$buf" | sed 's/.$//')]"
}
deps_json=$(serialize)

sum_path="$HOME"/.cache/hyprcw/dep_sum
full_path="$HOME"/.cache/hyprcw/deps_full
dep_sum=$(echo -n "$deps_json" | md5sum | sed "s/  -//")
mkdir -p "$HOME"/.cache/hyprcw
if [[ -f $sum_path ]] && [[ -f $full_path ]] && [[ $dep_sum == $(< "$sum_path") ]]; then
	deps_full=$(< "$full_path")
else
deps_gen=$(curl https://api.jspm.io/generate -s -d "{\"install\": ${deps_json}}")
deps_map=$(json2 "$.map.*" "$deps_gen" -j -u)

static_deps=$(json2 "$.staticDeps.*" "$deps_gen" -b | tr "\n" " ")

# shellcheck disable=SC2016
script='array=($1)
for i in "${array[@]}"; do
	printf "<link rel=\"modulepreload\" href=\"${i}\" />"
done'

preloads=$(bash <(printf '%s' "$script") "$static_deps")

deps_full="<script type=\"importmap\">${deps_map}</script>
<script async src=\"https://ga.jspm.io/npm:es-module-shims@1.5.1/dist/es-module-shims.js\" crossorigin=\"anonymous\"></script>
${preloads}"
touch "$sum_path"
touch "$full_path"
rm "$sum_path"
rm "$full_path"
printf '%s' "$dep_sum" > "$sum_path"
printf '%s' "$deps_full" > "$full_path"
fi

title=$1
body=$(< "$2")
head_style=$(< "$3")

./template.sh "$title" "$head_style" "$deps_full" "$body" ""
