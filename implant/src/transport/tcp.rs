use super::Transport;

pub struct TCPConnection {}

impl Transport for TCPConnection {
    fn connect(&mut self, address: &str) -> Result<(), String> {
        println!("connecting");

        Ok(())
    }

    fn send(&self, data: &[u8]) -> std::io::Result<()> {
        println!("sending");

        Ok(())
    }

    fn receive(&mut self) -> std::io::Result<Vec<u8>> {
        println!("receiving");

        Ok(())
    }
}
