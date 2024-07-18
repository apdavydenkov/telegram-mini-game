import os
import re

def collect_files(src_dirs, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    grouped_content = {}

    for src_dir in src_dirs:
        src_type = "client_src" if "client" in src_dir else "server_src"
        for root, dirs, files in os.walk(src_dir):
            for file in files:
                if file.endswith(('.js', '.jsx')):
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(root, src_dir)
                    
                    if relative_path == '.':
                        group = src_type
                    else:
                        group = f"{src_type}_{relative_path.split(os.sep)[0]}"
                    
                    if group not in grouped_content:
                        grouped_content[group] = []

                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        grouped_content[group].append(f"// Код файла {os.path.join(relative_path, file)}:\n{content}\n")

    for group, contents in grouped_content.items():
        output_file = os.path.join(output_dir, f"{group}_collected.txt")
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(f"// Собранный код для папки {group}\n\n")
            f.write("\n".join(contents))

    print(f"Файлы успешно собраны и сгруппированы в папке {output_dir}")

# Использование скрипта
script_dir = os.path.dirname(os.path.abspath(__file__))  # Директория, где находится скрипт
client_src = os.path.join(script_dir, "client", "src")
server_src = os.path.join(script_dir, "server", "src")
output_directory = os.path.join(script_dir, "collected_files")  # Папка для сохранения рядом со скриптом

collect_files([client_src, server_src], output_directory)