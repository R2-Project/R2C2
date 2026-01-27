use sysinfo::System;

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

pub fn env() -> String {
    let mut env_list = Vec::new();

    env_list.push("Environment Variables: \n".to_string());

    for (key, value) in std::env::vars() {
        env_list.push(format!("{}={}", key, value));
    }

    env_list.join("\n")
}
