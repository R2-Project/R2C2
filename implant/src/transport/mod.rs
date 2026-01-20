use crate::tasks::Task;
use crate::Beacon;
use serde::Serialize;
use std::error::Error;

pub trait Transport {
    async fn fetch_tasks(&self, beacon: &Beacon) -> Result<Vec<Task>, Box<dyn Error>>;
    async fn post_data<T: Serialize>(
        &self,
        beacon: &Beacon,
        data: &T,
    ) -> Result<(), Box<dyn Error>>;
}
#[cfg(feature = "http")]
pub mod http;

#[cfg(feature = "http")]
pub use http::HttpConnection as ActiveTransport;

#[cfg(not(any(feature = "http")))]
compile_error!("You must enable at least one transport feature (e.g., 'http' or 'tcp').");
