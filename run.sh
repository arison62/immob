#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

python manage.py migrate --noinput
python manage.py collectstatic --noinput
python manage.py createsuperuser --email $DJANGO_SUPERUSER_EMAIL --username $DJANGO_SUPERUSER_USERNAME --password $DJANGO_SUPERUSER_PASSWORD --noinput