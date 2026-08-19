"""Проверяет, что готовый архив пригоден для загрузки в public_html.

Файлы сайта обязаны лежать в корне архива, без вложенной папки, а исходники
проекта попадать туда не должны. Запускается из workflow после шага Create ZIP.
"""

import os
import sys
import zipfile

package = os.environ.get('PACKAGE', 'banya-timeweb-production.zip')
names = zipfile.ZipFile(package).namelist()
errors = []

# 1. Никакой вложенной папки в корне архива
for prefix in ('out/', 'banya-timeweb-production/', './'):
    nested = [n for n in names if n.startswith(prefix)]
    if nested:
        errors.append(f'в архиве есть вложенный префикс {prefix!r}: {nested[:3]}')

# 2. Обязательные файлы — непосредственно в корне
for required in ('index.html', '.htaccess', '404.html', 'robots.txt', 'sitemap.xml'):
    if required not in names:
        errors.append(f'в корне архива нет {required}')

# 3. Каталог сборки Next.js на месте
if not any(n.startswith('_next/') for n in names):
    errors.append('в архиве нет каталога _next/')

# 4. Исходников быть не должно
for src in ('app/', 'components/', 'lib/', 'node_modules/', '.next/',
            'scripts/', 'reference/', '.git/', '.github/'):
    if any(n.startswith(src) for n in names):
        errors.append(f'в архиве найдены исходники {src}')

for src in ('package.json', 'package-lock.json', 'tsconfig.json',
            'next.config.mjs', '.env', '.env.example'):
    if src in names:
        errors.append(f'в архиве найден исходный файл {src}')

# 5. Исходники media не попали
for src in ('hero.mp4', 'hero.png'):
    if src in names:
        errors.append(f'в архиве остался исходник {src}')

if errors:
    for message in errors:
        print(f'::error::{message}')
    sys.exit(1)

print(f'файлов в архиве: {len(names)}')
print('в корне архива:')
for entry in sorted({n.split('/')[0] for n in names}):
    print('   ', entry)
print('проверки пройдены')
