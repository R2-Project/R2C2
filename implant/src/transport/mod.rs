pub trait Transport {
    fn connect(&mut self, address: &str) -> Result<(), String>;
    fn send(&self, data: &[u8]) -> std::io::Result<()>;
    fn receive(&mut self) -> std::io::Result<Vec<u8>>;
}
#[cfg(feature = "http")]
pub mod http;

#[cfg(feature = "http")]
pub use http::HttpConnection as ActiveTransport;

#[cfg(not(any(feature = "http")))]
compile_error!("You must enable at least one transport feature (e.g., 'http' or 'tcp').");
