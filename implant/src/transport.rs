pub trait Transport {
    fn connect(&mut self, address: &str) -> Result<(), String>;
    fn send(&self, data: &[u8]) -> std::io::Result<()>;
    fn receive(&mut self) -> std::io::Result<Vec<u8>>;
}

#[cfg(feature = "http")]
pub mod http;

#[cfg(feature = "tcp")]
pub mod tcp;

#[cfg(feature = "websocket")]
pub mod websocket;

pub fn load_transport() -> Box<dyn Transport> {
    #[cfg(feature = "http")]
    {
        Box::new(http::HttpConnection {});
    }

    #[cfg(feature = "tcp")]
    {
        Box::new(tcp::TCPConnection {});
    }

    Err("No transport feature enabled".to_string()).unwrap()
}
