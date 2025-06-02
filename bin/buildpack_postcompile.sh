#!/bin/bash

set -o errexit    # always exit on error
set -o pipefail   # don't ignore exit codes when piping output

echo "-----> Running post-compile script"

rm -rf docker docs env.d gitlint src/frontend src/helm

# du -ch | sort -rh | head -n 100
