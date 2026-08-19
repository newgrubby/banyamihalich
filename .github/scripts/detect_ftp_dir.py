"""Готовит параметры подключения к FTP и определяет каталог публикации.

Делает две вещи:

1. Приводит значение секрета FTP_SERVER к чистому имени хоста. В поле секрета
   легко случайно сохранить `ftp://host`, `host:21`, `host/` или значение с
   пробелом — всё это не резолвится, и деплой падает с невнятной ошибкой
   разрешения имени.
2. Проверяет, что каталог публикации существует. Обычно это /public_html/,
   но у Timeweb сайт нередко лежит на уровень глубже — в <домен>/public_html.
   Если подходящего каталога нет, сборка падает: лучше остановиться,
   чем выложить сайт в случайное место.

Значения секретов нигде не печатаются: хост и логин дополнительно
скрываются через ::add-mask::, наружу идут только производные признаки.
"""

import ftplib
import os
import socket
import sys

raw_host = os.environ.get('FTP_SERVER', '')
raw_user = os.environ.get('FTP_USERNAME', '')
password = os.environ.get('FTP_PASSWORD', '')
wanted = os.environ.get('TARGET_DIR', '/public_html/')

missing = [
    name for name, value in (
        ('FTP_SERVER', raw_host),
        ('FTP_USERNAME', raw_user),
        ('FTP_PASSWORD', password),
    ) if not value.strip()
]
if missing:
    print(f'::error::не заданы секреты репозитория: {", ".join(missing)}')
    sys.exit(1)


def clean_host(value: str) -> str:
    """Оставляет от значения только имя хоста."""
    host = value.strip().strip('"').strip("'")
    for scheme in ('ftps://', 'ftp://', 'sftp://', 'http://', 'https://'):
        if host.lower().startswith(scheme):
            host = host[len(scheme):]
    host = host.split('/', 1)[0]          # отбрасываем путь
    host = host.split('@')[-1]            # отбрасываем user@ если он попал сюда
    if host.count(':') == 1:              # отбрасываем порт, но не ломаем IPv6
        host = host.split(':', 1)[0]
    return host.strip().rstrip('.')


host = clean_host(raw_host)
user = raw_user.strip().strip('"').strip("'")

# Очищенные значения отличаются от секретов, поэтому маскируются отдельно
print(f'::add-mask::{host}')
print(f'::add-mask::{user}')

changes = []
if host != raw_host:
    changes.append('FTP_SERVER')
if user != raw_user:
    changes.append('FTP_USERNAME')
if changes:
    print(f'значения секретов приведены к рабочему виду: {", ".join(changes)}')
    print(f'  FTP_SERVER: было символов {len(raw_host)}, стало {len(host)}; '
          f'схема: {"://" in raw_host}, порт: {raw_host.strip().count(":") > 0}, '
          f'слэш: {"/" in raw_host.strip()}, пробелы: {raw_host != raw_host.strip()}')

if not host:
    print('::error::в секрете FTP_SERVER не осталось имени хоста после очистки')
    sys.exit(1)

try:
    address = socket.gethostbyname(host)
except OSError as error:
    print('::error::имя FTP-сервера не разрешается в адрес')
    print(f'::error::после очистки в значении {len(host)} символов, '
          f'точек: {host.count(".")}, ошибка: {error}')
    print('::error::в секрете FTP_SERVER должно быть только имя хоста, '
          'например vh470.timeweb.ru — без ftp://, без :21 и без пробелов')
    sys.exit(1)

print(f'::add-mask::{address}')
print('имя FTP-сервера разрешается в адрес — соединяемся')

ftp = ftplib.FTP()
try:
    ftp.connect(host, 21, timeout=45)
    ftp.login(user, password)
except ftplib.all_errors as error:
    print(f'::error::не удалось подключиться или авторизоваться на FTP: {error}')
    sys.exit(1)

ftp.set_pasv(True)
start = ftp.pwd()
print(f'вход выполнен, стартовый каталог: {start}')


def normalize(path: str) -> str:
    return '/' + path.strip('/') + '/' if path.strip('/') else '/'


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
    """Список подкаталогов. MLSD поддерживают не все серверы — есть запасной путь."""
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
    handle.write(f'server={host}\n')
    handle.write(f'username={user}\n')
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
