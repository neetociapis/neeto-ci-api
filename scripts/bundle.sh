find ./docs -name "*.yaml" -type f -exec sh -c 'swagger-cli bundle "$1" -o "bundled/$(basename "$1" .yaml).yaml"' _ {} \;
