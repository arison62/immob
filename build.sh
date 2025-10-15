#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

pip install -r requirements.txt
npm install
npm run build
python manage.py migrate --noinput
python manage.py collectstatic --noinput
