import os
import re

def should_ignore(path, base_dir, ignore_patterns):
    normalized_path = os.path.normpath(os.path.join(base_dir, path)).replace(os.sep, '/')
    print(f"Checking path: {normalized_path}")
    for pattern in ignore_patterns:
        if pattern.search(normalized_path):
            print(f"  Ignored: {normalized_path} (matched pattern: {pattern.pattern})")
            return True
    print(f"  Not ignored: {normalized_path}")
    return False

def collect_files(src_dirs, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Чтение паттернов игнорирования
    ignore_patterns = []
    ignore_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'compile_ignore.txt')
    print(f"Looking for ignore file at: {ignore_file}")
    if os.path.exists(ignore_file):
        with open(ignore_file, 'r') as f:
            ignore_patterns = [line.strip() for line in f if line.strip() and not line.startswith('#')]
        ignore_patterns = [re.compile(pattern.replace('*', '.*').replace('?', '.')) for pattern in ignore_patterns]
        print(f"Loaded ignore patterns: {[p.pattern for p in ignore_patterns]}")
    else:
        print("Warning: compile_ignore.txt not found.")

    grouped_content = {}
    for src_dir in src_dirs:
        src_type = "client_src" if "client" in src_dir else "server_src"
        print(f"Processing directory: {src_dir}")
        for root, dirs, files in os.walk(src_dir):
            relative_path = os.path.relpath(root, src_dir)
            print(f"Checking directory: {relative_path}")
            if should_ignore(relative_path, src_dir, ignore_patterns):
                print(f"Ignoring directory: {relative_path}")
                dirs[:] = []  # Прекращаем обход этой директории
                continue
            
            for file in files:
                if file.endswith(('.js', '.jsx')):
                    file_path = os.path.join(root, file)
                    relative_file_path = os.path.relpath(file_path, src_dir)
                    print(f"Checking file: {relative_file_path}")
                    if should_ignore(relative_file_path, src_dir, ignore_patterns):
                        continue
                    
                    if relative_path == '.':
                        group = src_type
                    else:
                        group = f"{src_type}_{relative_path.split(os.sep)[0]}"
                    
                    print(f"Adding file to group: {group}")
                    if group not in grouped_content:
                        grouped_content[group] = []
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        grouped_content[group].append(f"// Код файла {relative_file_path}:\n{content}\n")
    
    for group, contents in grouped_content.items():
        output_file = os.path.join(output_dir, f"{group}_collected.txt")
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(f"// Собранный код для папки {group}\n// Внимание! Здесь собраны только нужные в работе файлы. Некоторые файлы связанные с конфигурацией, авторизацией, некоторые компоненты могли не попасть в эту сборку, если не относятся к решению задачи!\n\n")
            f.write("\n".join(contents))
        print(f"Created: {output_file}")
    
    print(f"Файлы успешно собраны и сгруппированы в папке {output_dir}")

# Использование скрипта
script_dir = os.path.dirname(os.path.abspath(__file__))
print(f"Script directory: {script_dir}")
client_src = os.path.join(script_dir, "client", "src")
server_src = os.path.join(script_dir, "server", "src")
output_directory = os.path.join(script_dir, "collected_files")
collect_files([client_src, server_src], output_directory)