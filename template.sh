# shellcheck shell=bash
set -euo pipefail

title=$1
head_style=$2
deps=$3
body=$4
extra_head=$5

base="
<!DOCTYPE html>
<html>
   <meta charset=\"UTF-8\" />
    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\" />
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
    <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\" />
    <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin />
    <link
      href=\"https://fonts.googleapis.com/css2?family=Nanum+Gothic+Coding:wght@400;700&family=Nanum+Pen+Script&display=swap\"
      rel=\"stylesheet\"
    />
		<link
      href=\"https://fonts.googleapis.com/css?family=Material+Icons&display=block\"
      rel=\"stylesheet\"
    />
		<title>${title}</title>
    <style>${head_style}</style>
		${extra_head}
  </head>
	<body>
		${deps}
		<script>
  		function openPage(url) {
    		window.open(url, \"_blank\") || window.location.replace(url);
  		}
		</script>
		<script type=\"module\">
			import \"@webcomponents/custom-elements\";
  		import \"@webcomponents/scoped-custom-element-registry\";
  		if (!globalThis.URLPattern) {
    		await import(\"urlpattern-polyfill\");
			};
		</script>
		${body}
	</body>
</html>
"

echo -n "$base"
