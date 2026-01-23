use std::fs;
use sysinfo::System;

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
        "{} {} {} {} {}",
        "Last Modified", "Mode", "Type", "Size", "Name"
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

            let modified = metadata.modified().ok();

            file_list.push(format!(
                "{:?} {:<12} {:<12} {:<12} {}",
                modified, mode_str, kind, size, name
            ));
        }
    }

    if file_list.is_empty() {
        return ".".to_string();
    }

    file_list.join("\n")
}

pub fn pwd() -> String {
    let cwd = std::env::current_dir().unwrap();
    cwd.display().to_string()
}

pub fn cd(args: &str) -> String {
    if args.is_empty() {
        return "No directory specified.".to_string();
    }

    let input_path = std::path::Path::new(args);
    let new_path = if input_path.is_absolute() {
        input_path.to_path_buf()
    } else {
        let cwd = std::env::current_dir().unwrap();
        cwd.join(input_path)
    };

    match std::env::set_current_dir(&new_path) {
        Ok(_) => format!("Changed directory to {}", new_path.display()),
        Err(e) => format!("Failed to change directory: {}", e),
    }
}

pub fn shell(args: &str) -> String {
    #[cfg(target_os = "windows")]
    let (shell, flag) = ("cmd", "/C");

    #[cfg(not(target_os = "windows"))]
    let (shell, flag) = ("sh", "-c");

    let output = std::process::Command::new(shell)
        .args([flag, args])
        .current_dir(std::env::current_dir().unwrap())
        .output()
        .ok();

    let stdout = String::from_utf8_lossy(&output.clone().unwrap().stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.clone().unwrap().stderr).to_string();

    // TODO: maybe should return both
    if stderr.is_empty() {
        stdout
    } else {
        stderr
    }
}

pub fn whoami() -> String {
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("whoami")
            .arg("/all")
            .output()
            .map(|output| String::from_utf8_lossy(&output.stdout).to_string())
            .unwrap_or_else(|e| format!("Failed to execute whoami: {}", e))
    }

    #[cfg(not(target_os = "windows"))]
    {
        std::process::Command::new("whoami")
            .output()
            .map(|output| String::from_utf8_lossy(&output.stdout).to_string())
            .unwrap_or_else(|e| format!("Failed to execute whoami: {}", e))
    }
}

pub fn ps() -> String {
    let mut sys = System::new_all();

    sys.refresh_all();
    std::thread::sleep(std::time::Duration::from_millis(100));
    sys.refresh_processes(sysinfo::ProcessesToUpdate::All, true);

    let mut ps_list = Vec::new();

    ps_list.push(format!(
        "{:<8} {:<60} {:<15} {:<10}",
        "PID", "NAME", "MEM (MB)", "CPU (%)",
    ));
    ps_list.push(format!("{}", "-".repeat(95)));

    for (pid, process) in sys.processes() {
        let pid_str = pid.to_string();
        ps_list.push(format!(
            "{:<8} {:<60} {:<15.2} {:<10.2}",
            pid_str,
            truncate(process.name().to_str().expect("unknown"), 60),
            process.memory() as f64 / 1024.0 / 1024.0, // bytes to MB
            process.cpu_usage()
        ));
    }

    ps_list.join("\n")
}

fn truncate(s: &str, max_chars: usize) -> &str {
    match s.char_indices().nth(max_chars) {
        None => s,
        Some((idx, _)) => &s[..idx],
    }
}
