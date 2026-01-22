use std::fs;

pub fn ls_command(args: &str) -> String {
    let cwd = std::env::current_dir().unwrap();

    // check if args exists, and if it is an aboslute path or relative path
    let path = if args.is_empty() {
        cwd
    } else {
        let input_path = std::path::Path::new(args);
        if input_path.is_absolute() {
            input_path.to_path_buf()
        } else {
            cwd.join(input_path)
        }
    };

    let path_clone = path.clone();

    let entries = fs::read_dir(path).unwrap_or_else(|_| fs::read_dir(".").unwrap());
    let mut file_list = Vec::new();

    file_list.push(format!("Listing for path: {}\n", path_clone.display()));

    file_list.push(format!(
        "{:<12} {:<12} {:<12} {}",
        "Mode", "Type", "Size", "Name"
    ));
    for entry in entries {
        if let Ok(entry) = entry {
            let metadata = match entry.metadata() {
                Ok(m) => m,
                Err(_) => continue,
            };

            let is_dir = metadata.is_dir();
            let perms = if metadata.permissions().readonly() {
                "r--"
            } else {
                "rw-"
            };
            let type_char = if is_dir { "d" } else { "-" };
            let mode_str = format!("{}{}", type_char, perms);

            let size = if is_dir {
                "-".to_string()
            } else {
                metadata.len().to_string()
            };
            let kind = if is_dir { "[DIR]" } else { "[FILE]" };

            let name = entry.file_name().to_string_lossy().to_string();

            file_list.push(format!(
                "{:<12} {:<12} {:<12} {}",
                mode_str, kind, size, name
            ));
        }
    }

    if file_list.is_empty() {
        return ".".to_string();
    }

    file_list.join("\n")
}

pub fn shell() -> Result<(), String> {
    println!("Executing shell command...");
    Ok(())
}
