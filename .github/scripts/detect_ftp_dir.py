"""Определяет каталог публикации на FTP хостинга.

Обычно это /public_html/, но у Timeweb сайт нередко лежит на уровень глубже —
в <домен>/public_html. Скрипт проверяет ожидаемый путь и, если его нет,
ищет фактический. Если подходящего каталога не нашлось, сборка падает:
лучше остановиться, чем выложить сайт в случайное место.

Пароль читается из окружения и никуда не печатается.
"""

import ftplib
import os
import sys

host = os.environ.get('FTP_SERVER', '')
user = os.environ.get('FTP_USERNAME', '')
password = os.environ.get('FTP_PASSWORD', '')
wanted = os.environ.get('TARGET_DIR', '/public_html/')

missing = [
    name for name, value in (
        ('FTP_SERVER', host),
        ('FTP_USERNAME', user),
        ('FTP_PASSWORD', password),
    ) if not value
]
if missing:
    print(f'::error::не заданы секреты репозитория: {", ".join(missing)}')
    sys.exit(1)


def normalize(path: str) -> str:
    return '/' + path.strip('/') + '/' if path.strip('/') else '/'


ftp = ftplib.FTP()
try:
    ftp.connect(host, 21, timeout=45)
    ftp.login(user, password)
except ftplib.all_errors as error:
    print(f'::error::не удалось подключиться к FTP {host}:21 — {error}')
    sys.exit(1)

ftp.set_pasv(True)
start = ftp.pwd()
print(f'вход выполнен, стартовый каталог: {start}')


def is_dir(path: str) -> bool:
    here = ftp.pwd()
    try:
        ftp.cwd(path)
        return True
    except ftplib.all_errors:
        return False
    finally:
        try:
            ftp.cwd(here)
        except ftplib.all_errors:
            pass


def subdirs(path: str) -> list:
    """Список подкаталогов. MLSD есть не везде, поэтому есть запасной путь."""
    try:
        ftp.cwd(path)
    except ftplib.all_errors:
        return []

    found = []
    try:
        for name, facts in ftp.mlsd():
            if name not in ('.', '..') and facts.get('type') == 'dir':
                found.append(name)
    except ftplib.all_errors:
        try:
            listing = ftp.nlst()
        except ftplib.all_errors:
            listing = []
        for raw in listing:
            name = raw.rstrip('/').rsplit('/', 1)[-1]
            if name and name not in ('.', '..') and is_dir(f'{path.rstrip("/")}/{name}'):
                found.append(name)
    return sorted(set(found))


top = subdirs(start)
print(f'подкаталоги: {top if top else "(нет)"}')

# Кандидаты по убыванию приоритета: заданный путь, public_html рядом со
# стартовым каталогом, затем public_html внутри каталогов сайтов.
nested = [
    f'{start.rstrip("/")}/{name}/public_html/'
    for name in top
    if name != 'public_html' and is_dir(f'{start.rstrip("/")}/{name}/public_html')
]
candidates = [wanted, f'{start.rstrip("/")}/public_html/'] + nested

chosen = None
seen = set()
for candidate in candidates:
    path = normalize(candidate)
    if path in seen:
        continue
    seen.add(path)
    if is_dir(path):
        chosen = path
        print(f'подходит: {path}')
        break
    print(f'нет каталога: {path}')

if chosen is None:
    print('::error::не найден каталог публикации на FTP')
    print(f'::error::стартовый каталог {start}, подкаталоги: {top}')
    print('::error::укажите верный путь в env.TARGET_DIR файла workflow')
    ftp.quit()
    sys.exit(1)

if len(nested) > 1 and chosen in nested:
    print(f'::warning::на аккаунте несколько сайтов: {nested}. Выбран {chosen}')

with open(os.environ['GITHUB_OUTPUT'], 'a', encoding='utf-8') as handle:
    handle.write(f'server_dir={chosen}\n')

summary = os.environ.get('GITHUB_STEP_SUMMARY')
if summary:
    with open(summary, 'a', encoding='utf-8') as handle:
        handle.write('## Публикация на Timeweb\n\n')
        handle.write(f'- стартовый каталог FTP: `{start}`\n')
        handle.write(f'- подкаталоги: `{top}`\n')
        handle.write(f'- каталог публикации: `{chosen}`\n')

print(f'каталог публикации: {chosen}')
ftp.quit()
