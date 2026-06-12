find ./docs -name "*.yaml" -type f -exec sh -c './node_modules/.bin/redocly bundle "$1" --output "bundled/$(basename "$1" .yaml).yaml"' _ {} \;
find ./docs-v1 -name "*.yaml" -type f -exec sh -c './node_modules/.bin/redocly bundle "$1" --output "bundled-v1/$(basename "$1" .yaml).yaml"' _ {} \;
