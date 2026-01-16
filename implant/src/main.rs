mod commands;
mod tasks;
mod transport;

use std::{thread, time::Duration};

use transport::{ActiveTransport, Transport};

use crate::tasks::Tasks;

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

#[tokio::main]
async fn main() {
    let beacon = Beacon::new();

    println!("Beacon Session: {}", beacon.id);
    println!("Server: {}", beacon.listener_address);

    let client = load_transport();

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
