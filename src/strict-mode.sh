#!/usr/bin/env bash

# A set of macros to spend less time debugging :)

# Resources:
# http://kvz.io/blog/2013/11/21/bash-best-practices/
# http://redsymbol.net/articles/unofficial-bash-strict-mode/

set -o errexit  # make your script exit when a command fails.
set -o pipefail # prevents errors in a pipeline from being masked. If any command in a pipeline fails, that return code will be used as the return code of the whole pipeline.
set -o nounset  # exit when your script tries to use undeclared variables.
#set -o xtrace   # trace what gets executed. Useful for debugging.