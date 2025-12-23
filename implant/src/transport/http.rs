use super::Transport;

pub struct HttpConnection {}

impl HttpConnection {
    pub fn new() -> Self {
        HttpConnection {}
    }
}

impl Transport for HttpConnection {
    fn connect(&mut self, address: &str) -> Result<(), String> {
        println!("HTTP: Connecting to {}", address);
        Ok(())
    }

    fn send(&self, _data: &[u8]) -> std::io::Result<()> {
        println!("HTTP: Sending data...");
        Ok(())
    }

    fn receive(&mut self) -> std::io::Result<Vec<u8>> {
        Ok(vec![])
    }
}
