mod commands;
mod tasks;
mod transport;

// use transport::Transport;

struct Beacon {
    id: String,
    listener_address: String,
    listener_port: u16,
}

impl Beacon {
    fn new() -> Self {
        Beacon {
            id: std::env::var("SESSION_ID").expect("no session id provided"),
            listener_address: std::env::var("LISTENER_ADDRESS")
                .expect("no listener address provided"),
            listener_port: std::env::var("LISTENER_PORT")
                .expect("no listener port provided")
                .parse()
                .expect("listener port not a number"),
        }
    }
}

fn main() {
    // let transport = transport::load_transport();

    let beacon = Beacon::new();

    println!("Beacon Session: {}", beacon.id);
    println!(
        "Server: {} {}",
        beacon.listener_address, beacon.listener_port
    );
}
