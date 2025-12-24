mod commands;
mod tasks;
mod transport;

use std::{thread, time::Duration};

use transport::{ActiveTransport, Transport};

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
            Ok(data) => {
                if !data.is_empty() {
                    print!("Received tasks: {:?}\n", data);
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
