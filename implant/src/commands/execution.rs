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

// FIXME: this is noisy, improve it
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
